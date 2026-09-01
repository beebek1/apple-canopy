import apiClient from "../../shared/apiClient";
import type {
  LoginRequest,
  ApiResponse,
  PostRequest,
  PostListResponse,
  SessionListResponse
} from "./auth.types";

// =====================================================AUTHs================================================================

export const loginApi = (data: LoginRequest) =>
  apiClient.post<ApiResponse>("/api/auth/login", data);

export const forgotPasswordApi = () =>
  apiClient.post<ApiResponse>("/api/auth/verify");

export const resetPasswordApi = (token: string) =>
  apiClient.post<ApiResponse>(`/api/auth/register?token=${token}`);

export const getCurrentUserApi = () =>
  apiClient.get<ApiResponse>(`/api/auth/me`);


// =====================================================SESSION================================================================
export const getSessionsApi = () =>
  apiClient.get<SessionListResponse>("/api/sessions");

export const revokeSessionApi = (sessionId: string) =>
  apiClient.delete<ApiResponse>(`/api/sessions/${sessionId}`);

export const revokeOtherSessionsApi = () =>
  apiClient.delete<ApiResponse>("/api/sessions");

export const logoutApi = () =>
  apiClient.post<ApiResponse>("/api/sessions/logout");
 


// =====================================================MEDIA================================================================

export const uploadImageApi = (formData: FormData) =>
  apiClient.post<ApiResponse<{ path: string }>>(`/api/media/upload`, formData);

export const saveDraftApi = (formData: FormData) =>
  apiClient.post<ApiResponse<{ id: string }>>("/api/posts/autosave", formData);

export const getPostApi = (id: string) =>
  apiClient.get<ApiResponse<PostRequest>>(`/api/posts/${id}`);

export const listPostsApi = (params: {
  status?: "all" | "published" | "draft";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => apiClient.get<ApiResponse<PostListResponse>>("/api/posts", { params });

export const updatePostStatusApi = (
  id: string,
  status: "published" | "draft",
) => apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/api/posts/${id}/status`,{ status });

export const deletePostApi = (id: string) =>
  apiClient.delete<ApiResponse<{ id: string }>>(`/api/posts/${id}`);