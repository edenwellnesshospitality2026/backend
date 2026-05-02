import { BookingModel } from "../../models/Booking.js";
import type { BookingPayload } from "../../types.js";

export const createBooking = async (booking: BookingPayload) => {
  const bookingId = booking.bookingId || `BK-${Date.now()}`;
  await BookingModel.create({
    bookingId,
    guestName: booking.guestName,
    phone: booking.phone,
    email: booking.email,
    listingName: booking.listingName,
    roomType: booking.roomType,
    checkIn: booking.checkIn ?? undefined,
    checkOut: booking.checkOut ?? undefined,
    nights: booking.nights,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    totalGuests: booking.totalGuests,
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus ?? "unpaid",
    bookingStatus: booking.bookingStatus ?? "new",
    confirmationCallStatus: booking.confirmationCallStatus,
    assignedStaffMember: booking.assignedStaffMember,
    bookingSource: booking.bookingSource ?? "website",
    notes: booking.notes,
    internalRemarks: booking.internalRemarks,
  });
  return { ...booking, bookingId };
};

export const listBookings = async (): Promise<BookingPayload[]> => {
  const docs = await BookingModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((row) => ({
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
    paymentStatus: row.paymentStatus,
    bookingStatus: row.bookingStatus,
    confirmationCallStatus: row.confirmationCallStatus ?? undefined,
    assignedStaffMember: row.assignedStaffMember ?? undefined,
    bookingSource: row.bookingSource,
    notes: row.notes ?? undefined,
    internalRemarks: row.internalRemarks ?? undefined,
  }));
};
