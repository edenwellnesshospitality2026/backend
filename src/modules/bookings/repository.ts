import { pool } from "../../db/pool.js";
import type { BookingPayload } from "../../types.js";

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
