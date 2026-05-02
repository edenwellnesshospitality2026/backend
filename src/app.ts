import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { v2 as cloudinary } from "cloudinary";
import { corsOrigins, env } from "./config/env.js";
import { isMongoConnected } from "./db/mongo.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { requireAuth, type AuthenticatedRequest } from "./middlewares/auth.js";
import { validateBody } from "./middlewares/validate.js";
import { bookingSchema } from "./modules/bookings/schema.js";
import { createBooking, listBookings } from "./modules/bookings/repository.js";
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
import { createContactEnquirySchema, patchContactEnquirySchema } from "./modules/contact-enquiries/schema.js";
import {
  createContactEnquiry,
  listContactEnquiries,
  updateContactEnquiryStatus,
} from "./modules/contact-enquiries/repository.js";
import {
  createBookingEnquirySchema,
  patchBookingEnquirySchema,
} from "./modules/booking-enquiries/schema.js";
import {
  createBookingEnquiry,
  listBookingEnquiries,
  updateBookingEnquiryStatus,
} from "./modules/booking-enquiries/repository.js";
import {
  galleryCategoryBodySchema,
  galleryImageBodySchema,
  guestStoryBodySchema,
  membershipTierBodySchema,
  presidentialSuiteBodySchema,
  roomCardShowcaseBodySchema,
  siteContentBodySchema,
} from "./modules/cms/schemas.js";
import * as cms from "./modules/cms/repository.js";
import { uploadMemory } from "./lib/upload.js";

if (env.CLOUDINARY_URL) {
  cloudinary.config();
}

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

  const enquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
  });

  app.get("/health", (_req, res) => {
    const mongoConnected = isMongoConnected();
    res.json({
      ok: true,
      service: "eden-backend-service",
      mongoConnected,
      database: mongoConnected ? "mongodb" : "mongodb_pending",
    });
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

    const saved = await createBooking(booking);
    return res.status(201).json({ data: saved });
  });

  app.get("/api/bookings", requireAuth, async (_req, res) => {
    const bookings = await listBookings();
    return res.json({ data: bookings });
  });

  app.post(
    "/api/contact-enquiries",
    enquiryLimiter,
    validateBody(createContactEnquirySchema),
    async (req, res) => {
      const doc = await createContactEnquiry(req.body);
      return res.status(201).json({ data: { id: String(doc._id) } });
    }
  );

  app.get("/api/contact-enquiries", requireAuth, async (_req, res) => {
    const rows = await listContactEnquiries();
    return res.json({ data: rows });
  });

  app.patch(
    "/api/contact-enquiries/:id",
    requireAuth,
    validateBody(patchContactEnquirySchema),
    async (req, res) => {
      const updated = await updateContactEnquiryStatus(
        String(req.params.id),
        (req.body as { status: "new" | "contacted" | "closed" }).status
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.json({ data: updated });
    }
  );

  app.post(
    "/api/booking-enquiries",
    enquiryLimiter,
    validateBody(createBookingEnquirySchema),
    async (req, res) => {
      const doc = await createBookingEnquiry(req.body);
      return res.status(201).json({ data: { id: String(doc._id) } });
    }
  );

  app.get("/api/booking-enquiries", requireAuth, async (_req, res) => {
    const rows = await listBookingEnquiries();
    return res.json({ data: rows });
  });

  app.patch(
    "/api/booking-enquiries/:id",
    requireAuth,
    validateBody(patchBookingEnquirySchema),
    async (req, res) => {
      const updated = await updateBookingEnquiryStatus(
        String(req.params.id),
        (req.body as { status: "new" | "contacted" | "closed" }).status
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.json({ data: updated });
    }
  );

  app.get("/api/cms/membership-tiers", async (_req, res) => {
    const rows = await cms.listMembershipTiersPublic();
    return res.json({ data: rows });
  });

  app.get("/api/cms/membership-tiers/manage", requireAuth, async (_req, res) => {
    const rows = await cms.listMembershipTiersAdmin();
    return res.json({ data: rows });
  });

  app.post(
    "/api/cms/membership-tiers",
    requireAuth,
    validateBody(membershipTierBodySchema),
    async (req, res) => {
      const doc = await cms.createMembershipTier(req.body as Record<string, unknown>);
      return res.status(201).json({ data: doc });
    }
  );

  app.put(
    "/api/cms/membership-tiers/:id",
    requireAuth,
    validateBody(membershipTierBodySchema),
    async (req, res) => {
      const doc = await cms.updateMembershipTier(String(req.params.id), req.body as Record<string, unknown>);
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.json({ data: doc });
    }
  );

  app.delete("/api/cms/membership-tiers/:id", requireAuth, async (req, res) => {
    await cms.deleteMembershipTier(String(req.params.id));
    res.status(204).send();
  });

  app.get("/api/cms/guest-stories", async (_req, res) => {
    const rows = await cms.listGuestStoriesPublic();
    return res.json({ data: rows });
  });

  app.get("/api/cms/guest-stories/manage", requireAuth, async (_req, res) => {
    const rows = await cms.listGuestStoriesAdmin();
    return res.json({ data: rows });
  });

  app.post(
    "/api/cms/guest-stories",
    requireAuth,
    validateBody(guestStoryBodySchema),
    async (req, res) => {
      const doc = await cms.createGuestStory(req.body as Record<string, unknown>);
      return res.status(201).json({ data: doc });
    }
  );

  app.put(
    "/api/cms/guest-stories/:id",
    requireAuth,
    validateBody(guestStoryBodySchema),
    async (req, res) => {
      const doc = await cms.updateGuestStory(String(req.params.id), req.body as Record<string, unknown>);
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.json({ data: doc });
    }
  );

  app.delete("/api/cms/guest-stories/:id", requireAuth, async (req, res) => {
    await cms.deleteGuestStory(String(req.params.id));
    res.status(204).send();
  });

  app.get("/api/cms/gallery", async (_req, res) => {
    const data = await cms.getGalleryPublic();
    return res.json({ data });
  });

  app.get("/api/cms/gallery/categories/manage", requireAuth, async (_req, res) => {
    const rows = await cms.listGalleryCategoriesAdmin();
    return res.json({ data: rows });
  });

  app.post(
    "/api/cms/gallery/categories",
    requireAuth,
    validateBody(galleryCategoryBodySchema),
    async (req, res) => {
      const doc = await cms.createGalleryCategory(req.body as Record<string, unknown>);
      return res.status(201).json({ data: doc });
    }
  );

  app.put(
    "/api/cms/gallery/categories/:id",
    requireAuth,
    validateBody(galleryCategoryBodySchema),
    async (req, res) => {
      const doc = await cms.updateGalleryCategory(String(req.params.id), req.body as Record<string, unknown>);
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.json({ data: doc });
    }
  );

  app.delete("/api/cms/gallery/categories/:id", requireAuth, async (req, res) => {
    await cms.deleteGalleryCategory(String(req.params.id));
    res.status(204).send();
  });

  app.get("/api/cms/gallery/images/manage", requireAuth, async (req, res) => {
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const rows = await cms.listGalleryImagesAdmin(categoryId);
    return res.json({ data: rows });
  });

  app.post(
    "/api/cms/gallery/images",
    requireAuth,
    validateBody(galleryImageBodySchema),
    async (req, res) => {
      const doc = await cms.createGalleryImage(req.body as Record<string, unknown>);
      return res.status(201).json({ data: doc });
    }
  );

  app.put(
    "/api/cms/gallery/images/:id",
    requireAuth,
    validateBody(galleryImageBodySchema.partial()),
    async (req, res) => {
      const doc = await cms.updateGalleryImage(String(req.params.id), req.body as Record<string, unknown>);
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.json({ data: doc });
    }
  );

  app.delete("/api/cms/gallery/images/:id", requireAuth, async (req, res) => {
    await cms.deleteGalleryImage(String(req.params.id));
    res.status(204).send();
  });

  app.get("/api/cms/presidential-suite", async (_req, res) => {
    const doc = await cms.getPresidentialSuitePublic();
    return res.json({ data: doc });
  });

  app.get("/api/cms/presidential-suite/manage", requireAuth, async (_req, res) => {
    const doc = await cms.getPresidentialSuiteAdmin();
    return res.json({ data: doc });
  });

  app.put(
    "/api/cms/presidential-suite",
    requireAuth,
    validateBody(presidentialSuiteBodySchema),
    async (req, res) => {
      const doc = await cms.upsertPresidentialSuite(req.body as Record<string, unknown>);
      return res.json({ data: doc });
    }
  );

  app.get("/api/cms/room-cards", async (_req, res) => {
    const rows = await cms.listRoomCardsPublic();
    return res.json({ data: rows });
  });

  app.get("/api/cms/room-cards/manage", requireAuth, async (_req, res) => {
    const rows = await cms.listRoomCardsAdmin();
    return res.json({ data: rows });
  });

  app.post(
    "/api/cms/room-cards",
    requireAuth,
    validateBody(roomCardShowcaseBodySchema),
    async (req, res) => {
      const doc = await cms.createRoomCard(req.body as Record<string, unknown>);
      return res.status(201).json({ data: doc });
    }
  );

  app.put(
    "/api/cms/room-cards/:id",
    requireAuth,
    validateBody(roomCardShowcaseBodySchema),
    async (req, res) => {
      const doc = await cms.updateRoomCard(String(req.params.id), req.body as Record<string, unknown>);
      if (!doc) return res.status(404).json({ error: "Not found" });
      return res.json({ data: doc });
    }
  );

  app.delete("/api/cms/room-cards/:id", requireAuth, async (req, res) => {
    await cms.deleteRoomCard(String(req.params.id));
    res.status(204).send();
  });

  app.get("/api/cms/site-content", async (req, res) => {
    const key = typeof req.query.key === "string" && req.query.key ? req.query.key : "homepage";
    const doc = await cms.getSiteContentByKey(key);
    return res.json({
      data:
        doc ??
        ({
          key,
          pickYourRoomTitle: "",
          pickYourRoomIntro: "",
          membershipIntro: "",
          guestStoriesIntro: "",
        } as const),
    });
  });

  app.get("/api/cms/site-content/manage", requireAuth, async (req, res) => {
    const key = typeof req.query.key === "string" && req.query.key ? req.query.key : "homepage";
    const doc = await cms.getSiteContentByKey(key);
    return res.json({ data: doc });
  });

  app.put(
    "/api/cms/site-content",
    requireAuth,
    validateBody(siteContentBodySchema),
    async (req, res) => {
      const doc = await cms.upsertSiteContent(req.body as Record<string, unknown>);
      return res.json({ data: doc });
    }
  );

  app.post(
    "/api/uploads/image",
    requireAuth,
    uploadMemory.single("file"),
    async (req, res, next) => {
      try {
        if (!env.CLOUDINARY_URL) {
          return res.status(503).json({ error: "Cloudinary is not configured (set CLOUDINARY_URL)." });
        }
        const file = req.file;
        if (!file?.buffer) {
          return res.status(400).json({ error: "Missing multipart field \"file\"" });
        }
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "eden" }, (err, result) => {
            if (err || !result) reject(err ?? new Error("Upload failed"));
            else resolve(result as { secure_url: string; public_id: string });
          });
          stream.end(file.buffer);
        });
        return res.json({
          data: { secureUrl: uploadResult.secure_url, publicId: uploadResult.public_id },
        });
      } catch (e) {
        return next(e);
      }
    }
  );

  app.use(errorHandler);

  return app;
};
