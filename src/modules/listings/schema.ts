import { z } from "zod";

const ratePlanSchema = z.object({
  id: z.string().min(1),
  code: z.enum(["EP", "CP", "MAP"]),
  title: z.string().min(1),
  description: z.string().min(1),
  mealInclusion: z.string().min(1),
  pricePerNight: z.number().nonnegative(),
  discountedPrice: z.number().nonnegative().optional(),
  availability: z.string().min(1),
  cancellationPolicySnippet: z.string().min(1),
  status: z.enum(["active", "inactive"]),
  availableInventory: z.number().int().nonnegative(),
  totalInventory: z.number().int().nonnegative(),
});

export const listingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
  listingType: z.string().min(1),
  category: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().optional(),
  maxGuests: z.number().int().positive(),
  baseOccupancy: z.number().int().positive(),
  amenities: z.array(z.string()),
  thumbnail: z.string().optional(),
  galleryImages: z.array(z.string()),
  basePrice: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  taxesInfo: z.string().optional(),
  availableInventory: z.number().int().nonnegative(),
  totalInventory: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().optional().default(new Date().toISOString()),
  ratePlans: z.array(ratePlanSchema).default([]),
});

export const inventorySchema = z.object({
  availableInventory: z.number().int().nonnegative(),
  totalInventory: z.number().int().nonnegative().optional(),
});

export const ratePlansSchema = z.object({
  ratePlans: z.array(ratePlanSchema),
});
