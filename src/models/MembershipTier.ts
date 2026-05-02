import mongoose, { Schema } from "mongoose";

const membershipTierSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceLabel: { type: String, default: "On request" },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    primaryCtaLabel: { type: String, default: "Talk to our team" },
    primaryCtaHref: { type: String, default: "tel:+917533909333" },
    secondaryCtaLabel: { type: String, default: "Email membership" },
    secondaryCtaHref: {
      type: String,
      default: "mailto:reservations@edenwellnesshospitality.com",
    },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

membershipTierSchema.index({ sortOrder: 1 });

export const MembershipTierModel =
  mongoose.models.MembershipTier ?? mongoose.model("MembershipTier", membershipTierSchema);
