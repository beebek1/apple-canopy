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
