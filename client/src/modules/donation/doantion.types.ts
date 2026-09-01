export type DonationStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELED";

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string | null;
  amount: number; // cents
  currency: string;
  note: string | null;
  status: DonationStatus;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  paidAt: string | null;
  updatedAt: string;
}

export interface CreateCheckoutSessionInput {
  donorName: string;
  amount: number;
  currency: string;
  donorEmail?: string;
  note?: string;
}