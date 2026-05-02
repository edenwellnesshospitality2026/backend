import { z } from "zod";

export const createContactEnquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  bookingType: z.string().optional(),
  message: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export const patchContactEnquirySchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});
