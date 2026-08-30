// add to your posts api file
import apiClient from "../../shared/apiClient";
import type { ApiResponse, PublicArticleDetail } from "./blog.types";
import type { PublicPostListResponse } from "./blog.types";

export const listPublicPostsApi = (params: {
  category?: string;
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}) =>
  apiClient.get<ApiResponse<PublicPostListResponse>>("/api/posts/public", {
    params,
  });



export const createCommentApi = (
  postId: string,
  content: string,
  authorName: string,
) =>
  apiClient.post<
    ApiResponse<{ id: string; content: string; createdAt: string }>
  >("/api/comments", { postId, content, authorName });

export const listCommentsApi = (postId: string) =>
  apiClient.get<
    ApiResponse<
      Array<{
        id: string;
        content: string;
        createdAt: string;
        authorName: string;
      }>
    >
  >(`/api/comments/post/${postId}`);

// add to your posts api file
export const getPublicPostApi = (id: string) =>
  apiClient.get<ApiResponse<PublicArticleDetail>>(`/api/posts/public/${id}`);
