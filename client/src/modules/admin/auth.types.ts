export type ApiResponse = {
  success: boolean;
  message: string;
  data: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};
