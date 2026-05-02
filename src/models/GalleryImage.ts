import mongoose, { Schema } from "mongoose";

const galleryImageSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "GalleryCategory", required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

galleryImageSchema.index({ categoryId: 1, sortOrder: 1 });

export const GalleryImageModel =
  mongoose.models.GalleryImage ?? mongoose.model("GalleryImage", galleryImageSchema);
