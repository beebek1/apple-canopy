import apiClient from "../../shared/apiClient";
import type { CreateCheckoutSessionInput, Donation } from "./donation.types";

export const createCheckoutSessionApi = async (
  data: CreateCheckoutSessionInput,
) => {
  const res = await apiClient.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-checkout-session`,
    data,
  );

  return res.data.data.url as string;
};

export const getSessionApi = async (sessionId: string): Promise<Donation> => {
  const res = await apiClient.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/payment/session/${sessionId}`,
  );

  return res.data.data;
};

export const getDonationsApi = async (): Promise<Donation[]> => {
  const res = await apiClient.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/payment/donations`,
  );

  return res.data.data;
};
