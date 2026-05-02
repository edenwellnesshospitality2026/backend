import { z } from "zod";

export const bookingSchema = z.object({
  bookingId: z.string().optional(),
  guestName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  listingName: z.string().min(1),
  roomType: z.string().min(1),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  nights: z.number().int().nonnegative().optional(),
  adults: z.number().int().nonnegative(),
  children: z.number().int().nonnegative(),
  infants: z.number().int().nonnegative(),
  totalGuests: z.number().int().positive(),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.enum(["paid", "partial", "unpaid", "refunded"]).optional(),
  bookingStatus: z
    .enum(["new", "pending", "confirmed", "cancelled", "checked-in", "checked-out"])
    .optional(),
  confirmationCallStatus: z.string().optional(),
  assignedStaffMember: z.string().optional(),
  bookingSource: z.string().optional(),
  notes: z.string().optional(),
  internalRemarks: z.string().optional(),
  /** e.g. "EP×1 @ ₹7,500/night · 2 nights" */
  ratePlanSummary: z.string().optional(),
  /** Room route id: studio, 1bhk, 2bhk, presidential */
  listingSlug: z.string().optional(),
});
