import type { EnquiryStatus } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import type { CreateInput, EnquiryDocument } from "./types.js";

export const createBookingEnquiry = async (input: CreateInput) => {
  return prisma.bookingEnquiry.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      guests: input.guests,
      checkIn: input.checkIn ?? null,
      listingSlug: input.listingSlug ?? null,
      roomName: input.roomName ?? null,
      ratePlanSummary: input.ratePlanSummary ?? null,
      estimatedTotal: input.estimatedTotal ?? null,
      notes: input.notes ?? null,
      sourceUrl: input.sourceUrl ?? null,
    },
  });
};

const mapRow = (d: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  guests: number;
  checkIn: string | null;
  listingSlug: string | null;
  roomName: string | null;
  ratePlanSummary: string | null;
  estimatedTotal: number | null;
  notes: string | null;
  sourceUrl: string | null;
  status: EnquiryStatus;
  createdAt: Date;
}): EnquiryDocument => ({
  id: d.id,
  fullName: d.fullName,
  email: d.email,
  phone: d.phone,
  guests: d.guests,
  checkIn: d.checkIn ?? undefined,
  listingSlug: d.listingSlug ?? undefined,
  roomName: d.roomName ?? undefined,
  ratePlanSummary: d.ratePlanSummary ?? undefined,
  estimatedTotal: d.estimatedTotal ?? undefined,
  notes: d.notes ?? undefined,
  sourceUrl: d.sourceUrl ?? undefined,
  status: d.status,
  createdAt: d.createdAt,
});

export const listBookingEnquiries = async (): Promise<EnquiryDocument[]> => {
  const rows = await prisma.bookingEnquiry.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapRow);
};

export const updateBookingEnquiryStatus = async (
  id: string,
  status: "new" | "contacted" | "closed"
) => {
  try {
    const doc = await prisma.bookingEnquiry.update({
      where: { id },
      data: { status: status as EnquiryStatus },
    });
    return mapRow(doc);
  } catch {
    return null;
  }
};
