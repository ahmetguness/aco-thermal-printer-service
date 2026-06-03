export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "PRINTER_ERROR"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  detail?: string;
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function createApiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}

export function createApiFailure(error: ApiError): ApiFailure {
  return {
    success: false,
    error,
  };
}
