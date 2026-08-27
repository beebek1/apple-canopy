import apiClient from "../../shared/apiClient";
import type { LoginRequest, ApiResponse } from "./auth.types";

export const loginApi = (data: LoginRequest) =>
  apiClient.post<ApiResponse>("/login", data);

export const forgotPasswordApi = () =>
  apiClient.post<ApiResponse>("/api/auth/verify");

export const resetPasswordApi = (token: string) =>
  apiClient.post<ApiResponse>(`/api/auth/register?token=${token}`);

export const getUser = () => apiClient.get(`/`);
