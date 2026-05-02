import mongoose, { Schema } from "mongoose";

const contactEnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bookingType: { type: String },
    message: { type: String },
    sourceUrl: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

contactEnquirySchema.index({ createdAt: -1 });

export const ContactEnquiryModel =
  mongoose.models.ContactEnquiry ?? mongoose.model("ContactEnquiry", contactEnquirySchema);
