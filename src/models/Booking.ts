import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    listingName: { type: String, required: true },
    roomType: { type: String, required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    nights: { type: Number },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    infants: { type: Number, required: true },
    totalGuests: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid", "refunded"],
      default: "unpaid",
    },
    bookingStatus: {
      type: String,
      enum: ["new", "pending", "confirmed", "cancelled", "checked-in", "checked-out"],
      default: "new",
    },
    confirmationCallStatus: { type: String },
    assignedStaffMember: { type: String },
    bookingSource: { type: String, default: "website" },
    notes: { type: String },
    internalRemarks: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ createdAt: -1 });

export const BookingModel =
  mongoose.models.Booking ?? mongoose.model("Booking", bookingSchema);
