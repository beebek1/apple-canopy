export type ApiResponse<T = string> = {
  success: boolean;
  message: string;
  data: T;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type PostRequest = {
  id: string;
  title: string;
  dek: string;
  category: string;
  heroImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  content: unknown;
};

export interface PostListItem {
  id: string;
  title: string;
  dek: string;
  category: string;
  heroImage: string | null;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  publishedAt: string | null;
  author: { name: string };
}

export interface PostListResponse {
  posts: PostListItem[];
  pagination: { page: number; limit: number; total: number };
  stats: { all: number; published: number; draft: number; totalViews: number };
}