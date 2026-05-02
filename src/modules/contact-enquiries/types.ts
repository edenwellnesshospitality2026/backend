export interface CreateInput {
  name: string;
  email: string;
  phone: string;
  bookingType?: string;
  message?: string;
  sourceUrl?: string;
}

export interface EnquiryDocument {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingType?: string;
  message?: string;
  sourceUrl?: string;
  status: string;
  createdAt: Date;
}
