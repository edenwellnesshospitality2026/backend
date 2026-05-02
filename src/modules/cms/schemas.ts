import { z } from "zod";

export const membershipTierBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priceLabel: z.string().optional(),
  features: z.array(z.string()).default([]),
  isPopular: z.boolean().optional(),
  primaryCtaLabel: z.string().optional(),
  primaryCtaHref: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const guestStoryBodySchema = z.object({
  headline: z.string().min(1),
  subtitle: z.string().optional(),
  youtubeUrl: z.string().url(),
  body: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  sideText: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const galleryCategoryBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

const absoluteOrPublicPathUrl = z.string().refine(
  (s) =>
    /^https?:\/\//i.test(s) ||
    (s.startsWith("/") && s.length > 1),
  { message: "Must be an absolute http(s) URL or a root-relative path starting with /" }
);

export const galleryImageBodySchema = z.object({
  categoryId: z.string().min(1),
  secureUrl: z.union([z.string().url(), absoluteOrPublicPathUrl]),
  publicId: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
