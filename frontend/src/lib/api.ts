import { API_BASE_URL } from "../config/env";
import type { ApiResponse } from "../types/api";
import type {
  ConnectionInfo,
  ConnectionMode,
  ImagePrintRequest,
  LogEntry,
  PrinterHealth,
  PrinterStatus,
  PrintJob,
  QrPrintRequest,
  ReceiptPrintRequest,
  TextPrintRequest,
} from "../types/printer";

export const logExportUrl = `${API_BASE_URL}/logs/export`;

export function connect(mode: ConnectionMode): Promise<ApiResponse<ConnectionInfo>> {
  return postJson<ConnectionInfo, { mode: ConnectionMode }>("/connect", { mode });
}

export function getStatus(): Promise<ApiResponse<PrinterStatus>> {
  return getJson<PrinterStatus>("/status");
}

export function printText(body: TextPrintRequest): Promise<ApiResponse<PrintJob>> {
  return postJson<PrintJob, TextPrintRequest>("/print/text", body);
}

export function printImage(body: ImagePrintRequest): Promise<ApiResponse<PrintJob>> {
  return postJson<PrintJob, ImagePrintRequest>("/print/image", body);
}

export function printQr(body: QrPrintRequest): Promise<ApiResponse<PrintJob>> {
  return postJson<PrintJob, QrPrintRequest>("/print/qr", body);
}

export function printReceipt(body: ReceiptPrintRequest): Promise<ApiResponse<PrintJob>> {
  return postJson<PrintJob, ReceiptPrintRequest>("/print/receipt", body);
}

export function reprint(jobId: string): Promise<ApiResponse<PrintJob>> {
  return postJson<PrintJob, { jobId: string }>("/reprint", { jobId });
}

export function getLogs(): Promise<ApiResponse<LogEntry[]>> {
  return getJson<LogEntry[]>("/logs");
}

export function setMockHealth(body: Partial<PrinterHealth>): Promise<ApiResponse<PrinterHealth>> {
  return postJson<PrinterHealth, Partial<PrinterHealth>>("/mock/health", body);
}

export function simulateDisconnect(): Promise<ApiResponse<ConnectionInfo>> {
  return postJson<ConnectionInfo, Record<string, never>>("/mock/disconnect", {});
}

async function getJson<TData>(path: string): Promise<ApiResponse<TData>> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return parseApiResponse<TData>(response);
}

async function postJson<TData, TBody extends object>(
  path: string,
  body: TBody,
): Promise<ApiResponse<TData>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseApiResponse<TData>(response);
}

async function parseApiResponse<TData>(response: Response): Promise<ApiResponse<TData>> {
  const parsed: unknown = await response.json();

  if (!isApiResponse<TData>(parsed)) {
    throw new Error(`Invalid API response from ${response.url}`);
  }

  return parsed;
}

function isApiResponse<TData>(value: unknown): value is ApiResponse<TData> {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success === true) {
    return "data" in value;
  }

  return isRecord(value.error) && typeof value.error.code === "string" && typeof value.error.message === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
