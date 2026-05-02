import mongoose, { Schema } from "mongoose";

const galleryCategorySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryCategorySchema.index({ sortOrder: 1 });

export const GalleryCategoryModel =
  mongoose.models.GalleryCategory ?? mongoose.model("GalleryCategory", galleryCategorySchema);
