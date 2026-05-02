import mongoose, { Schema } from "mongoose";

const bookingEnquirySchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
    checkIn: { type: String },
    listingSlug: { type: String },
    roomName: { type: String },
    ratePlanSummary: { type: String },
    estimatedTotal: { type: Number },
    notes: { type: String },
    sourceUrl: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

bookingEnquirySchema.index({ createdAt: -1 });

export const BookingEnquiryModel =
  mongoose.models.BookingEnquiry ?? mongoose.model("BookingEnquiry", bookingEnquirySchema);
