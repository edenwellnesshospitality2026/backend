import mongoose, { Schema } from "mongoose";

const ratePlanSchema = new Schema(
  {
    id: { type: String, required: true },
    code: { type: String, enum: ["EP", "CP", "MAP"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    mealInclusion: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    discountedPrice: { type: Number },
    availability: { type: String, required: true },
    cancellationPolicySnippet: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], required: true },
    availableInventory: { type: Number, required: true },
    totalInventory: { type: Number, required: true },
  },
  { _id: false }
);

const listingSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String },
    listingType: { type: String, required: true },
    category: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String },
    maxGuests: { type: Number, required: true },
    baseOccupancy: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    thumbnail: { type: String },
    galleryImages: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    taxesInfo: { type: String },
    availableInventory: { type: Number, required: true },
    totalInventory: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], required: true },
    createdAt: { type: Date, required: true },
    ratePlans: { type: [ratePlanSchema], default: [] },
  },
  { _id: false }
);

listingSchema.index({ slug: 1 }, { unique: true, sparse: true });

export const ListingModel =
  mongoose.models.Listing ?? mongoose.model("Listing", listingSchema);
