import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { requireAuth, type AuthenticatedRequest } from "./middlewares/auth.js";
import { validateBody } from "./middlewares/validate.js";
import { bookingSchema } from "./modules/bookings/schema.js";
import { createBooking } from "./modules/bookings/repository.js";
import { changePasswordSchema, loginSchema } from "./modules/auth/schema.js";
import {
  authenticateUser,
  changePassword,
  fetchAuthUser,
} from "./modules/auth/service.js";
import { inventorySchema, listingSchema, ratePlansSchema } from "./modules/listings/schema.js";
import {
  deleteListing,
  getListingById,
  listListings,
  updateInventory,
  upsertListing,
} from "./modules/listings/repository.js";
import type { BookingPayload, Listing } from "./types.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  const authLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "eden-backend-service" });
  });

  app.post("/api/auth/login", authLimiter, validateBody(loginSchema), async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authenticateUser(email, password);
    if (!result) return res.status(401).json({ error: "Invalid credentials" });
    return res.json({
      data: {
        token: result.token,
        user: result.user,
      },
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    const user = await fetchAuthUser(req.auth!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ data: user });
  });

  app.post(
    "/api/auth/change-password",
    requireAuth,
    validateBody(changePasswordSchema),
    async (req: AuthenticatedRequest, res) => {
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };
      const changed = await changePassword(req.auth!.userId, currentPassword, newPassword);
      if (!changed) return res.status(400).json({ error: "Current password is incorrect" });
      return res.json({ data: { changed: true } });
    }
  );

  app.get("/api/listings", async (_req, res) => {
    const listings = await listListings();
    res.json({ data: listings });
  });

  app.post("/api/listings", requireAuth, validateBody(listingSchema), async (req, res) => {
    const listing = req.body as Listing;
    const saved = await upsertListing(listing);
    return res.status(201).json({ data: saved });
  });

  app.put("/api/listings/:id", requireAuth, validateBody(listingSchema), async (req, res) => {
    const id = String(req.params.id);
    const listing = req.body as Listing;
    const saved = await upsertListing({ ...listing, id });
    return res.json({ data: saved });
  });

  app.patch(
    "/api/listings/:id/inventory",
    requireAuth,
    validateBody(inventorySchema),
    async (req, res) => {
      const id = String(req.params.id);
      const existing = await getListingById(id);
      if (!existing) return res.status(404).json({ error: "Listing not found." });
      const { availableInventory, totalInventory } = req.body as {
        availableInventory: number;
        totalInventory?: number;
      };
      await updateInventory(id, availableInventory, totalInventory);
      const updated = await getListingById(id);
      return res.json({ data: updated });
    }
  );

  app.put(
    "/api/listings/:id/rate-plans",
    requireAuth,
    validateBody(ratePlansSchema),
    async (req, res) => {
      const id = String(req.params.id);
      const existing = await getListingById(id);
      if (!existing) return res.status(404).json({ error: "Listing not found." });
      const { ratePlans } = req.body as { ratePlans: Listing["ratePlans"] };
      const saved = await upsertListing({ ...existing, ratePlans, id });
      return res.json({ data: saved });
    }
  );

  app.delete("/api/listings/:id", requireAuth, async (req, res) => {
    await deleteListing(String(req.params.id));
    res.status(204).send();
  });

  app.post("/api/bookings", validateBody(bookingSchema), async (req, res) => {
    const payload = req.body as BookingPayload;
    const booking: BookingPayload = {
      ...payload,
      bookingId: payload.bookingId || `BK-${Date.now()}`,
      bookingStatus: payload.bookingStatus || "new",
      paymentStatus: payload.paymentStatus || "unpaid",
      bookingSource: payload.bookingSource || "website",
    };

    await createBooking(booking);
    return res.status(201).json({ data: booking });
  });

  app.use(errorHandler);

  return app;
};
