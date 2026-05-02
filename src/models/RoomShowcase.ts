import mongoose, { Schema } from "mongoose";

const showcaseImageSchema = new Schema(
  {
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

/** Pick Your Room / Suite grid cards only (not the Presidential Suite block). */
const roomShowcaseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    headline: { type: String, required: true },
    description: { type: String, required: true },
    sizeLabel: { type: String, default: "" },
    images: { type: [showcaseImageSchema], default: [] },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    bookHref: { type: String, default: "/booking" },
    startingPrice: { type: Number },
    /** Optional nightly rates (₹, excl. taxes). When unset, booking derives CP/MAP from EP formulas. */
    rateEp: { type: Number },
    rateCp: { type: Number },
    rateMap: { type: Number },
    showPricing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roomShowcaseSchema.index({ sortOrder: 1 });
roomShowcaseSchema.index({ published: 1 });

export const RoomShowcaseModel =
  mongoose.models.RoomShowcase ?? mongoose.model("RoomShowcase", roomShowcaseSchema);
