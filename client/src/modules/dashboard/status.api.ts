import apiClient from "../../shared/apiClient";
import type { ApiResponse } from "../admin/auth.types";
export interface StatusSlot {
  id: string;
  slot: number;
  category: string;
  heading: string;
  body: string;
  bodyType: "paragraph" | "quote";
  image: string;
}

export const listPublicStatusesApi = () =>
  apiClient.get<ApiResponse<StatusSlot[]>>("/api/status/public");

export const upsertStatusApi = (slot: number, formData: FormData) =>
  apiClient.put<ApiResponse<{ id: string }>>(`/api/status/${slot}`, formData);

export const getCurrentUserApi = () =>
  apiClient.get<ApiResponse>(`/api/auth/me`);
