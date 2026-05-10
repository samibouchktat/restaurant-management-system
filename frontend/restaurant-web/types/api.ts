export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
  timestamp: string;
};