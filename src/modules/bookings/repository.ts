import { pool } from "../../db/pool.js";
import type { BookingPayload } from "../../types.js";

interface BookingRow {
  booking_id: string;
  guest_name: string;
  phone: string;
  email: string | null;
  listing_name: string;
  room_type: string;
  check_in: string | null;
  check_out: string | null;
  nights: number | null;
  adults: number;
  children: number;
  infants: number;
  total_guests: number;
  total_amount: string;
  payment_status: BookingPayload["paymentStatus"];
  booking_status: BookingPayload["bookingStatus"];
  confirmation_call_status: string | null;
  assigned_staff_member: string | null;
  booking_source: string;
  notes: string | null;
  internal_remarks: string | null;
}

export const createBooking = async (booking: BookingPayload) => {
  await pool.query(
    `
    INSERT INTO bookings (
      booking_id, guest_name, phone, email, listing_name, room_type,
      check_in, check_out, nights, adults, children, infants, total_guests,
      total_amount, payment_status, booking_status, confirmation_call_status,
      assigned_staff_member, booking_source, notes, internal_remarks
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19, $20, $21
    )
    `,
    [
      booking.bookingId,
      booking.guestName,
      booking.phone,
      booking.email ?? null,
      booking.listingName,
      booking.roomType,
      booking.checkIn ?? null,
      booking.checkOut ?? null,
      booking.nights ?? null,
      booking.adults,
      booking.children,
      booking.infants,
      booking.totalGuests,
      booking.totalAmount,
      booking.paymentStatus,
      booking.bookingStatus,
      booking.confirmationCallStatus ?? null,
      booking.assignedStaffMember ?? null,
      booking.bookingSource,
      booking.notes ?? null,
      booking.internalRemarks ?? null,
    ]
  );
  return booking;
};

export const listBookings = async (): Promise<BookingPayload[]> => {
  const result = await pool.query<BookingRow>(
    `
    SELECT
      booking_id, guest_name, phone, email, listing_name, room_type,
      check_in, check_out, nights, adults, children, infants, total_guests,
      total_amount, payment_status, booking_status, confirmation_call_status,
      assigned_staff_member, booking_source, notes, internal_remarks
    FROM bookings
    ORDER BY created_at DESC
    `
  );

  return result.rows.map((row) => ({
    bookingId: row.booking_id,
    guestName: row.guest_name,
    phone: row.phone,
    email: row.email ?? undefined,
    listingName: row.listing_name,
    roomType: row.room_type,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights ?? undefined,
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    totalGuests: row.total_guests,
    totalAmount: Number(row.total_amount),
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    confirmationCallStatus: row.confirmation_call_status ?? undefined,
    assignedStaffMember: row.assigned_staff_member ?? undefined,
    bookingSource: row.booking_source,
    notes: row.notes ?? undefined,
    internalRemarks: row.internal_remarks ?? undefined,
  }));
};
