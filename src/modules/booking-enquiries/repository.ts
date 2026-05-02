import { BookingEnquiryModel } from "../../models/BookingEnquiry.js";
import type { CreateInput, EnquiryDocument } from "./types.js";

export const createBookingEnquiry = async (input: CreateInput) => {
  return BookingEnquiryModel.create(input);
};

export const listBookingEnquiries = async (): Promise<EnquiryDocument[]> => {
  const docs = await BookingEnquiryModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    guests: d.guests,
    checkIn: d.checkIn,
    listingSlug: d.listingSlug,
    roomName: d.roomName,
    ratePlanSummary: d.ratePlanSummary,
    estimatedTotal: d.estimatedTotal,
    notes: d.notes,
    sourceUrl: d.sourceUrl,
    status: d.status,
    createdAt: d.createdAt,
  }));
};

export const updateBookingEnquiryStatus = async (
  id: string,
  status: "new" | "contacted" | "closed"
) => {
  return BookingEnquiryModel.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: "after" }).lean();
};
