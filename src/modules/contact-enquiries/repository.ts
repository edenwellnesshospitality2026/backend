import type { EnquiryStatus } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import type { CreateInput, EnquiryDocument } from "./types.js";

export const createContactEnquiry = async (input: CreateInput) => {
  return prisma.contactEnquiry.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      bookingType: input.bookingType ?? null,
      message: input.message ?? null,
      sourceUrl: input.sourceUrl ?? null,
    },
  });
};

const mapRow = (d: {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingType: string | null;
  message: string | null;
  sourceUrl: string | null;
  status: EnquiryStatus;
  createdAt: Date;
}): EnquiryDocument => ({
  id: d.id,
  name: d.name,
  email: d.email,
  phone: d.phone,
  bookingType: d.bookingType ?? undefined,
  message: d.message ?? undefined,
  sourceUrl: d.sourceUrl ?? undefined,
  status: d.status,
  createdAt: d.createdAt,
});

export const listContactEnquiries = async (): Promise<EnquiryDocument[]> => {
  const rows = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapRow);
};

export const updateContactEnquiryStatus = async (
  id: string,
  status: "new" | "contacted" | "closed"
) => {
  try {
    const doc = await prisma.contactEnquiry.update({
      where: { id },
      data: { status: status as EnquiryStatus },
    });
    return mapRow(doc);
  } catch {
    return null;
  }
};
