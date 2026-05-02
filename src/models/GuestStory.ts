import mongoose, { Schema } from "mongoose";

const guestStorySchema = new Schema(
  {
    headline: { type: String, required: true },
    subtitle: { type: String },
    youtubeUrl: { type: String, required: true },
    body: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    sideText: { type: String },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

guestStorySchema.index({ sortOrder: 1 });

export const GuestStoryModel =
  mongoose.models.GuestStory ?? mongoose.model("GuestStory", guestStorySchema);
