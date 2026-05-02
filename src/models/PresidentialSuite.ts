import mongoose, { Schema } from "mongoose";

const presidentialImageSchema = new Schema(
  {
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

/** Singleton marketing block for the Presidential Suite section (separate from Pick Your Room cards). */
const presidentialSuiteSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    headline: { type: String, required: true },
    description: { type: String, required: true },
    sizeLabel: { type: String, default: "" },
    images: { type: [presidentialImageSchema], default: [] },
    published: { type: Boolean, default: true },
    bookHref: { type: String, default: "/booking" },
    bookButtonLabel: { type: String, default: "Book Now" },
    startingPrice: { type: Number },
    rateEp: { type: Number },
    rateCp: { type: Number },
    rateMap: { type: Number },
    showPricing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PresidentialSuiteModel =
  mongoose.models.PresidentialSuite ??
  mongoose.model("PresidentialSuite", presidentialSuiteSchema);
