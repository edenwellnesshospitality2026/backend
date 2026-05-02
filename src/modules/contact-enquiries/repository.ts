import { ContactEnquiryModel } from "../../models/ContactEnquiry.js";
import type { CreateInput, EnquiryDocument } from "./types.js";

export const createContactEnquiry = async (input: CreateInput) => {
  return ContactEnquiryModel.create(input);
};

export const listContactEnquiries = async (): Promise<EnquiryDocument[]> => {
  const docs = await ContactEnquiryModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    email: d.email,
    phone: d.phone,
    bookingType: d.bookingType,
    message: d.message,
    sourceUrl: d.sourceUrl,
    status: d.status,
    createdAt: d.createdAt,
  }));
};

export const updateContactEnquiryStatus = async (id: string, status: "new" | "contacted" | "closed") => {
  const doc = await ContactEnquiryModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { returnDocument: "after" }
  ).lean();
  return doc;
};
