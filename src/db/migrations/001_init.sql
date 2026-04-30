CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  listing_type TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  max_guests INTEGER NOT NULL,
  base_occupancy INTEGER NOT NULL,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_price NUMERIC(12,2) NOT NULL,
  discount_price NUMERIC(12,2),
  taxes_info TEXT,
  available_inventory INTEGER NOT NULL,
  total_inventory INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_plans (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meal_inclusion TEXT NOT NULL,
  price_per_night NUMERIC(12,2) NOT NULL,
  discounted_price NUMERIC(12,2),
  availability TEXT NOT NULL,
  cancellation_policy_snippet TEXT NOT NULL,
  status TEXT NOT NULL,
  available_inventory INTEGER NOT NULL,
  total_inventory INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  listing_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  nights INTEGER,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL,
  infants INTEGER NOT NULL,
  total_guests INTEGER NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_status TEXT NOT NULL,
  booking_status TEXT NOT NULL,
  confirmation_call_status TEXT,
  assigned_staff_member TEXT,
  booking_source TEXT NOT NULL,
  notes TEXT,
  internal_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_email TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_checkout ON bookings(check_in, check_out);
