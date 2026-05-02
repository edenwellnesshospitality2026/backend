import mongoose, { Schema } from "mongoose";

/** Singleton-style homepage copy (one doc per key, e.g. `homepage`). */
const siteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    pickYourRoomTitle: { type: String, default: "" },
    pickYourRoomIntro: { type: String, default: "" },
    membershipIntro: { type: String, default: "" },
    guestStoriesIntro: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SiteContentModel =
  mongoose.models.SiteContent ?? mongoose.model("SiteContent", siteContentSchema);
