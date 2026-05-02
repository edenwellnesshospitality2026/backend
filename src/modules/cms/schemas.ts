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

export const galleryImageBodySchema = z.object({
  categoryId: z.string().min(1),
  secureUrl: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

const showcaseImageSchema = z.object({
  secureUrl: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
});

/** Pick Your Room / Suite grid cards (Eden Haven, Residence, Grand). */
export const roomCardShowcaseBodySchema = z.object({
  slug: z.string().min(1),
  headline: z.string().min(1),
  description: z.string().min(1),
  sizeLabel: z.string().optional(),
  images: z.array(showcaseImageSchema).default([]),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  bookHref: z.string().optional(),
  startingPrice: z.number().optional(),
  /** Omit or number for create; use `null` on update to clear stored override (fallback to formulas). */
  rateEp: z.union([z.number().nonnegative(), z.null()]).optional(),
  rateCp: z.union([z.number().nonnegative(), z.null()]).optional(),
  rateMap: z.union([z.number().nonnegative(), z.null()]).optional(),
  showPricing: z.boolean().optional(),
});

/** Singleton Presidential Suite marketing section (separate from room cards). */
export const presidentialSuiteBodySchema = z.object({
  headline: z.string().min(1),
  description: z.string().min(1),
  sizeLabel: z.string().optional(),
  images: z.array(showcaseImageSchema).default([]),
  published: z.boolean().optional(),
  bookHref: z.string().optional(),
  bookButtonLabel: z.string().optional(),
  startingPrice: z.number().optional(),
  rateEp: z.union([z.number().nonnegative(), z.null()]).optional(),
  rateCp: z.union([z.number().nonnegative(), z.null()]).optional(),
  rateMap: z.union([z.number().nonnegative(), z.null()]).optional(),
  showPricing: z.boolean().optional(),
});

export const heroSlideBodySchema = z.object({
  secureUrl: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const siteContentBodySchema = z.object({
  key: z.string().min(1),
  pickYourRoomTitle: z.string().optional(),
  pickYourRoomIntro: z.string().optional(),
  membershipIntro: z.string().optional(),
  guestStoriesIntro: z.string().optional(),
  heroSlides: z.array(heroSlideBodySchema).optional(),
  corporateLinkUrl: z.union([z.string().url(), z.literal("")]).optional(),
  corporateLinkVisible: z.boolean().optional(),
});
