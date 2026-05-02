import type { BookingStatus as PrismaBookingStatus, PaymentStatus } from "@prisma/client";
import { BookingStatus as PrismaBooking } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import type { BookingPayload, BookingStatus as ApiBookingStatus, PaymentStatus as ApiPaymentStatus } from "../../types.js";

const toApiPayment = (s: PaymentStatus): ApiPaymentStatus => s as ApiPaymentStatus;

/** API uses `checked-in`; Prisma client uses `checked_in` (DB column still stores enum per migration). */
const toPrismaBookingStatus = (s: ApiBookingStatus | undefined): PrismaBookingStatus => {
  if (s === "checked-in") return PrismaBooking.checked_in;
  if (s === "checked-out") return PrismaBooking.checked_out;
  if (s === "new") return PrismaBooking.new;
  if (s === "pending") return PrismaBooking.pending;
  if (s === "confirmed") return PrismaBooking.confirmed;
  if (s === "cancelled") return PrismaBooking.cancelled;
  return PrismaBooking.new;
};

const toApiBooking = (s: PrismaBookingStatus): ApiBookingStatus => {
  if (s === "checked_in") return "checked-in";
  if (s === "checked_out") return "checked-out";
  return s as ApiBookingStatus;
};

export const createBooking = async (booking: BookingPayload) => {
  const bookingId = booking.bookingId || `BK-${Date.now()}`;
  await prisma.booking.create({
    data: {
      bookingId,
      guestName: booking.guestName,
      phone: booking.phone,
      email: booking.email ?? null,
      listingName: booking.listingName,
      roomType: booking.roomType,
      checkIn: booking.checkIn ?? null,
      checkOut: booking.checkOut ?? null,
      nights: booking.nights ?? null,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      totalGuests: booking.totalGuests,
      totalAmount: booking.totalAmount,
      paymentStatus: (booking.paymentStatus ?? "unpaid") as PaymentStatus,
      bookingStatus: toPrismaBookingStatus(booking.bookingStatus ?? "new"),
      confirmationCallStatus: booking.confirmationCallStatus ?? null,
      assignedStaffMember: booking.assignedStaffMember ?? null,
      bookingSource: booking.bookingSource ?? "website",
      notes: booking.notes ?? null,
      internalRemarks: booking.internalRemarks ?? null,
    },
  });
  return { ...booking, bookingId };
};

export const listBookings = async (): Promise<BookingPayload[]> => {
  const rows = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    bookingId: row.bookingId,
    guestName: row.guestName,
    phone: row.phone,
    email: row.email ?? undefined,
    listingName: row.listingName,
    roomType: row.roomType,
    checkIn: row.checkIn ?? undefined,
    checkOut: row.checkOut ?? undefined,
    nights: row.nights ?? undefined,
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    totalGuests: row.totalGuests,
    totalAmount: row.totalAmount,
    paymentStatus: toApiPayment(row.paymentStatus),
    bookingStatus: toApiBooking(row.bookingStatus),
    confirmationCallStatus: row.confirmationCallStatus ?? undefined,
    assignedStaffMember: row.assignedStaffMember ?? undefined,
    bookingSource: row.bookingSource,
    notes: row.notes ?? undefined,
    internalRemarks: row.internalRemarks ?? undefined,
  }));
};
