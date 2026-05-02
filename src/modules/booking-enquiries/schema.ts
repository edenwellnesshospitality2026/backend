import { z } from "zod";

export const createBookingEnquirySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  guests: z.number().int().positive(),
  checkIn: z.string().optional(),
  listingSlug: z.string().optional(),
  roomName: z.string().optional(),
  ratePlanSummary: z.string().optional(),
  estimatedTotal: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export const patchBookingEnquirySchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});
