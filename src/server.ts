import "dotenv/config";
import express from "express";
import cors from "cors";
import type { BookingPayload, Listing } from "./types.js";
import {
  appendBooking,
  deleteListing,
  listListings,
  saveListing,
} from "./storage.js";
import { insertLead, supabaseEnabled } from "./supabase.js";

const app = express();
const port = Number(process.env.PORT || 8090);
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      corsOrigins.length > 0
        ? corsOrigins
        : ["http://localhost:8080", "http://localhost:8081"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "eden-backend-service" });
});

app.get("/api/listings", async (_req, res) => {
  const listings = await listListings();
  res.json({ data: listings });
});

app.post("/api/listings", async (req, res) => {
  const listing = req.body as Listing;
  if (!listing?.id || !listing?.name) {
    return res.status(400).json({ error: "Listing id and name are required." });
  }
  const saved = await saveListing(listing);
  return res.status(201).json({ data: saved });
});

app.put("/api/listings/:id", async (req, res) => {
  const id = req.params.id;
  const listing = req.body as Listing;
  if (!id) return res.status(400).json({ error: "Listing id missing." });
  const saved = await saveListing({ ...listing, id });
  return res.json({ data: saved });
});

app.patch("/api/listings/:id/inventory", async (req, res) => {
  const id = req.params.id;
  const { availableInventory, totalInventory } = req.body as {
    availableInventory: number;
    totalInventory?: number;
  };
  const listings = await listListings();
  const found = listings.find((x) => x.id === id);
  if (!found) return res.status(404).json({ error: "Listing not found." });

  found.availableInventory = Number(availableInventory);
  if (typeof totalInventory === "number") {
    found.totalInventory = totalInventory;
  }
  await saveListing(found);
  return res.json({ data: found });
});

app.put("/api/listings/:id/rate-plans", async (req, res) => {
  const id = req.params.id;
  const { ratePlans } = req.body as { ratePlans: Listing["ratePlans"] };
  const listings = await listListings();
  const found = listings.find((x) => x.id === id);
  if (!found) return res.status(404).json({ error: "Listing not found." });

  found.ratePlans = ratePlans || [];
  await saveListing(found);
  return res.json({ data: found });
});

app.delete("/api/listings/:id", async (req, res) => {
  await deleteListing(req.params.id);
  res.status(204).send();
});

app.post("/api/bookings", async (req, res) => {
  const payload = req.body as BookingPayload;
  if (!payload?.guestName || !payload?.phone || !payload?.listingName) {
    return res
      .status(400)
      .json({ error: "guestName, phone and listingName are required." });
  }

  const booking: BookingPayload = {
    ...payload,
    bookingId: payload.bookingId || `BK-${Date.now()}`,
    bookingStatus: payload.bookingStatus || "new",
    paymentStatus: payload.paymentStatus || "unpaid",
    bookingSource: payload.bookingSource || "website",
  };

  await appendBooking(booking);

  if (supabaseEnabled) {
    await insertLead({
      name: booking.guestName,
      email: booking.email || null,
      phone: booking.phone,
      number_of_guests: booking.totalGuests,
      check_in: booking.checkIn || null,
      check_out: booking.checkOut || null,
      stay_package: "BookingFlow",
      room_type: booking.listingName,
      room_description: booking.roomType,
      special_request: booking.notes || null,
      source: booking.bookingSource,
    });
  }

  return res.status(201).json({ data: booking });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unknown server error";
  return res.status(500).json({ error: message });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`eden-backend-service running on http://localhost:${port}`);
});
