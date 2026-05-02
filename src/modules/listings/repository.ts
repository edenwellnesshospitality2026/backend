import { ListingModel } from "../../models/Listing.js";
import type { Listing, RatePlan } from "../../types.js";

const mapRatePlan = (p: Record<string, unknown>): RatePlan => ({
  id: String(p.id),
  code: p.code as RatePlan["code"],
  title: String(p.title),
  description: String(p.description),
  mealInclusion: String(p.mealInclusion),
  pricePerNight: Number(p.pricePerNight),
  discountedPrice: p.discountedPrice != null ? Number(p.discountedPrice) : undefined,
  availability: String(p.availability),
  cancellationPolicySnippet: String(p.cancellationPolicySnippet),
  status: p.status as RatePlan["status"],
  availableInventory: Number(p.availableInventory),
  totalInventory: Number(p.totalInventory),
});

const mapDocToListing = (doc: Record<string, unknown>): Listing => ({
  id: String(doc._id),
  name: String(doc.name),
  slug: doc.slug ? String(doc.slug) : undefined,
  listingType: String(doc.listingType),
  category: String(doc.category),
  shortDescription: String(doc.shortDescription),
  fullDescription: doc.fullDescription ? String(doc.fullDescription) : undefined,
  maxGuests: Number(doc.maxGuests),
  baseOccupancy: Number(doc.baseOccupancy),
  amenities: (doc.amenities as string[]) ?? [],
  thumbnail: doc.thumbnail ? String(doc.thumbnail) : undefined,
  galleryImages: (doc.galleryImages as string[]) ?? [],
  basePrice: Number(doc.basePrice),
  discountPrice: doc.discountPrice != null ? Number(doc.discountPrice) : undefined,
  taxesInfo: doc.taxesInfo ? String(doc.taxesInfo) : undefined,
  availableInventory: Number(doc.availableInventory),
  totalInventory: Number(doc.totalInventory),
  status: doc.status as Listing["status"],
  createdAt:
    doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : String(doc.createdAt ?? new Date().toISOString()),
  ratePlans: Array.isArray(doc.ratePlans) ? doc.ratePlans.map((x) => mapRatePlan(x as Record<string, unknown>)) : [],
});

export const listListings = async (): Promise<Listing[]> => {
  const docs = await ListingModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => mapDocToListing(d as Record<string, unknown>));
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  const doc = await ListingModel.findById(id).lean();
  if (!doc) return null;
  return mapDocToListing(doc as Record<string, unknown>);
};

export const upsertListing = async (listing: Listing): Promise<Listing> => {
  const createdAt = listing.createdAt ? new Date(listing.createdAt) : new Date();
  await ListingModel.findByIdAndUpdate(
    listing.id,
    {
      _id: listing.id,
      name: listing.name,
      slug: listing.slug || undefined,
      listingType: listing.listingType,
      category: listing.category,
      shortDescription: listing.shortDescription,
      fullDescription: listing.fullDescription,
      maxGuests: listing.maxGuests,
      baseOccupancy: listing.baseOccupancy,
      amenities: listing.amenities,
      thumbnail: listing.thumbnail,
      galleryImages: listing.galleryImages,
      basePrice: listing.basePrice,
      discountPrice: listing.discountPrice,
      taxesInfo: listing.taxesInfo,
      availableInventory: listing.availableInventory,
      totalInventory: listing.totalInventory,
      status: listing.status,
      createdAt,
      ratePlans: listing.ratePlans.map((rp) => ({
        id: rp.id,
        code: rp.code,
        title: rp.title,
        description: rp.description,
        mealInclusion: rp.mealInclusion,
        pricePerNight: rp.pricePerNight,
        discountedPrice: rp.discountedPrice,
        availability: rp.availability,
        cancellationPolicySnippet: rp.cancellationPolicySnippet,
        status: rp.status,
        availableInventory: rp.availableInventory,
        totalInventory: rp.totalInventory,
      })),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  const saved = await getListingById(listing.id);
  if (!saved) throw new Error("Failed to persist listing");
  return saved;
};

export const deleteListing = async (id: string) => {
  await ListingModel.findByIdAndDelete(id);
};

export const updateInventory = async (
  id: string,
  availableInventory: number,
  totalInventory?: number
) => {
  const update: Record<string, number> = { availableInventory };
  if (typeof totalInventory === "number") {
    update.totalInventory = totalInventory;
  }
  await ListingModel.findByIdAndUpdate(id, { $set: update });
};
