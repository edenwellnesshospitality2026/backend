export interface CreateInput {
  fullName: string;
  email: string;
  phone: string;
  guests: number;
  checkIn?: string;
  listingSlug?: string;
  roomName?: string;
  ratePlanSummary?: string;
  estimatedTotal?: number;
  notes?: string;
  sourceUrl?: string;
}

export interface EnquiryDocument {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  guests: number;
  checkIn?: string;
  listingSlug?: string;
  roomName?: string;
  ratePlanSummary?: string;
  estimatedTotal?: number;
  notes?: string;
  sourceUrl?: string;
  status: string;
  createdAt: Date;
}
