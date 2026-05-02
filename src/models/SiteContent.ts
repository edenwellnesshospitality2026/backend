import mongoose, { Schema } from "mongoose";

const heroSlideSchema = new Schema(
  {
    sortOrder: { type: Number, default: 0 },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

/** Singleton-style homepage copy (one doc per key, e.g. `homepage`). */
const siteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    pickYourRoomTitle: { type: String, default: "" },
    pickYourRoomIntro: { type: String, default: "" },
    membershipIntro: { type: String, default: "" },
    guestStoriesIntro: { type: String, default: "" },
    heroSlides: { type: [heroSlideSchema], default: [] },
    corporateLinkUrl: { type: String, default: "" },
    corporateLinkVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SiteContentModel =
  mongoose.models.SiteContent ?? mongoose.model("SiteContent", siteContentSchema);
