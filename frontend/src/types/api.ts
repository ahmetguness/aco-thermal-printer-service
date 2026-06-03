export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "PRINTER_ERROR"
  | "INTERNAL_ERROR"
  | "UNAUTHORIZED";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  detail?: string;
}

export type ApiSuccess<TData> = {
  success: true;
  data: TData;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;
