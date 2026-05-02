import {
  type ListingStatus,
  type Prisma,
  type RatePlanCode,
  type RatePlanStatus,
} from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import type { Listing, RatePlan } from "../../types.js";

const jsonStringArray = (v: Prisma.JsonValue): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x));
  return [];
};

const mapRatePlan = (p: {
  externalPlanId: string;
  code: RatePlanCode;
  title: string;
  description: string;
  mealInclusion: string;
  pricePerNight: number;
  discountedPrice: number | null;
  availability: string;
  cancellationPolicySnippet: string;
  status: RatePlanStatus;
  availableInventory: number;
  totalInventory: number;
}): RatePlan => ({
  id: p.externalPlanId,
  code: p.code as RatePlan["code"],
  title: p.title,
  description: p.description,
  mealInclusion: p.mealInclusion,
  pricePerNight: p.pricePerNight,
  discountedPrice: p.discountedPrice ?? undefined,
  availability: p.availability,
  cancellationPolicySnippet: p.cancellationPolicySnippet,
  status: p.status as RatePlan["status"],
  availableInventory: p.availableInventory,
  totalInventory: p.totalInventory,
});

const mapRowToListing = (row: {
  id: string;
  name: string;
  slug: string | null;
  listingType: string;
  category: string;
  shortDescription: string;
  fullDescription: string | null;
  maxGuests: number;
  baseOccupancy: number;
  amenities: Prisma.JsonValue;
  thumbnail: string | null;
  galleryImages: Prisma.JsonValue;
  basePrice: number;
  discountPrice: number | null;
  taxesInfo: string | null;
  availableInventory: number;
  totalInventory: number;
  status: ListingStatus;
  createdAt: Date;
  ratePlans: {
    externalPlanId: string;
    code: RatePlanCode;
    title: string;
    description: string;
    mealInclusion: string;
    pricePerNight: number;
    discountedPrice: number | null;
    availability: string;
    cancellationPolicySnippet: string;
    status: RatePlanStatus;
    availableInventory: number;
    totalInventory: number;
  }[];
}): Listing => ({
  id: row.id,
  name: row.name,
  slug: row.slug ?? undefined,
  listingType: row.listingType,
  category: row.category,
  shortDescription: row.shortDescription,
  fullDescription: row.fullDescription ?? undefined,
  maxGuests: row.maxGuests,
  baseOccupancy: row.baseOccupancy,
  amenities: jsonStringArray(row.amenities),
  thumbnail: row.thumbnail ?? undefined,
  galleryImages: jsonStringArray(row.galleryImages),
  basePrice: row.basePrice,
  discountPrice: row.discountPrice ?? undefined,
  taxesInfo: row.taxesInfo ?? undefined,
  availableInventory: row.availableInventory,
  totalInventory: row.totalInventory,
  status: row.status as Listing["status"],
  createdAt: row.createdAt.toISOString(),
  ratePlans: row.ratePlans.map((rp) => mapRatePlan(rp)),
});

export const listListings = async (): Promise<Listing[]> => {
  const rows = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { ratePlans: true },
  });
  return rows.map((r) => mapRowToListing(r));
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  const row = await prisma.listing.findUnique({
    where: { id },
    include: { ratePlans: true },
  });
  if (!row) return null;
  return mapRowToListing(row);
};

export const upsertListing = async (listing: Listing): Promise<Listing> => {
  const createdAt = listing.createdAt ? new Date(listing.createdAt) : new Date();
  const amenities = listing.amenities as Prisma.InputJsonValue;
  const galleryImages = listing.galleryImages as Prisma.InputJsonValue;

  await prisma.$transaction(async (tx) => {
    await tx.listing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        name: listing.name,
        slug: listing.slug || null,
        listingType: listing.listingType,
        category: listing.category,
        shortDescription: listing.shortDescription,
        fullDescription: listing.fullDescription ?? null,
        maxGuests: listing.maxGuests,
        baseOccupancy: listing.baseOccupancy,
        amenities,
        thumbnail: listing.thumbnail ?? null,
        galleryImages,
        basePrice: listing.basePrice,
        discountPrice: listing.discountPrice ?? null,
        taxesInfo: listing.taxesInfo ?? null,
        availableInventory: listing.availableInventory,
        totalInventory: listing.totalInventory,
        status: listing.status as ListingStatus,
        createdAt,
      },
      update: {
        name: listing.name,
        slug: listing.slug || null,
        listingType: listing.listingType,
        category: listing.category,
        shortDescription: listing.shortDescription,
        fullDescription: listing.fullDescription ?? null,
        maxGuests: listing.maxGuests,
        baseOccupancy: listing.baseOccupancy,
        amenities,
        thumbnail: listing.thumbnail ?? null,
        galleryImages,
        basePrice: listing.basePrice,
        discountPrice: listing.discountPrice ?? null,
        taxesInfo: listing.taxesInfo ?? null,
        availableInventory: listing.availableInventory,
        totalInventory: listing.totalInventory,
        status: listing.status as ListingStatus,
        createdAt,
      },
    });

    await tx.listingRatePlan.deleteMany({ where: { listingId: listing.id } });
    if (listing.ratePlans.length > 0) {
      await tx.listingRatePlan.createMany({
        data: listing.ratePlans.map((rp) => ({
          listingId: listing.id,
          externalPlanId: rp.id,
          code: rp.code as RatePlanCode,
          title: rp.title,
          description: rp.description,
          mealInclusion: rp.mealInclusion,
          pricePerNight: rp.pricePerNight,
          discountedPrice: rp.discountedPrice ?? null,
          availability: rp.availability,
          cancellationPolicySnippet: rp.cancellationPolicySnippet,
          status: rp.status as RatePlanStatus,
          availableInventory: rp.availableInventory,
          totalInventory: rp.totalInventory,
        })),
      });
    }
  });

  const saved = await getListingById(listing.id);
  if (!saved) throw new Error("Failed to persist listing");
  return saved;
};

export const deleteListing = async (id: string) => {
  await prisma.listing.delete({ where: { id } }).catch(() => undefined);
};

export const updateInventory = async (
  id: string,
  availableInventory: number,
  totalInventory?: number
) => {
  const data: { availableInventory: number; totalInventory?: number } = { availableInventory };
  if (typeof totalInventory === "number") {
    data.totalInventory = totalInventory;
  }
  await prisma.listing.update({ where: { id }, data });
};
