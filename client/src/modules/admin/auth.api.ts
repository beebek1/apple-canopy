import apiClient from "../../shared/apiClient";
import type { LoginRequest, ApiResponse, PostRequest } from "./auth.types";

export const loginApi = (data: LoginRequest) =>
  apiClient.post<ApiResponse>("/api/auth/login", data);

export const forgotPasswordApi = () =>
  apiClient.post<ApiResponse>("/api/auth/verify");

export const resetPasswordApi = (token: string) =>
  apiClient.post<ApiResponse>(`/api/auth/register?token=${token}`);

export const getCurrentUserApi = () => 
  apiClient.get<ApiResponse>(`/api/auth/me`)


export const uploadImageApi = (formData: FormData) =>
  apiClient.post<ApiResponse<{ path: string }>>(`/api/media/upload`, formData);

export const saveDraftApi = (formData: FormData) =>
  apiClient.post<ApiResponse<{ id: string }>>("/api/posts/autosave", formData);

export const getPostApi = (id:string) =>
  apiClient.get<ApiResponse< PostRequest >>(`/api/posts/${id}`);

