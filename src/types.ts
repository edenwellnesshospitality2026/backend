export type BookingStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "checked-in"
  | "checked-out";

export type PaymentStatus = "paid" | "partial" | "unpaid" | "refunded";
export type RatePlanCode = "EP" | "CP" | "MAP";

export interface BookingPayload {
  bookingId?: string;
  guestName: string;
  phone: string;
  email?: string;
  listingName: string;
  roomType: string;
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number;
  adults: number;
  children: number;
  infants: number;
  totalGuests: number;
  totalAmount: number;
  paymentStatus?: PaymentStatus;
  bookingStatus?: BookingStatus;
  confirmationCallStatus?: string;
  assignedStaffMember?: string;
  bookingSource?: string;
  notes?: string;
  internalRemarks?: string;
}

export interface RatePlan {
  id: string;
  code: RatePlanCode;
  title: string;
  description: string;
  mealInclusion: string;
  pricePerNight: number;
  discountedPrice?: number;
  availability: string;
  cancellationPolicySnippet: string;
  status: "active" | "inactive";
  availableInventory: number;
  totalInventory: number;
}

export interface Listing {
  id: string;
  name: string;
  slug?: string;
  listingType: string;
  category: string;
  shortDescription: string;
  fullDescription?: string;
  maxGuests: number;
  baseOccupancy: number;
  amenities: string[];
  thumbnail?: string;
  galleryImages: string[];
  basePrice: number;
  discountPrice?: number;
  taxesInfo?: string;
  availableInventory: number;
  totalInventory: number;
  status: "active" | "inactive";
  createdAt: string;
  ratePlans: RatePlan[];
}

export interface StoreData {
  listings: Listing[];
  bookings: BookingPayload[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}
