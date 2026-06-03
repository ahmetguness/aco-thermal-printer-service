export type ConnectionMode = "usb" | "lan";

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export type PrintJobType = "text" | "image" | "qr" | "receipt";

export type PrintJobStatus = "queued" | "printing" | "success" | "failed";

export type PrinterErrorCode =
  | "PAPER_OUT"
  | "PAPER_JAM"
  | "COVER_OPEN"
  | "OVERHEAT"
  | "COMM_ERROR"
  | "UNKNOWN_COMMAND";

export interface PrinterError {
  code: PrinterErrorCode;
  detail: string;
  userMessage: string;
}

export interface PrinterHealth {
  paper: "ok" | "out" | "near_end";
  cover: "closed" | "open";
  temperature: "normal" | "overheat";
}

export interface SimulationOptions {
  simulateError?: PrinterErrorCode;
}

export interface ConnectionInfo {
  mode: ConnectionMode | null;
  state: ConnectionState;
  reconnectAttempts: number;
  nextReconnectAt: string | null;
  lastConnectedAt: string | null;
}

export interface QueueSummary {
  queued: number;
  printing: number;
  success: number;
  failed: number;
  total: number;
}

export interface PrintJob<TPayload = unknown> {
  id: string;
  type: PrintJobType;
  status: PrintJobStatus;
  conn: ConnectionMode | null;
  payload: TPayload;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  error?: PrinterError;
}

export interface PrinterStatus {
  connection: ConnectionInfo;
  health: PrinterHealth;
  lastJob: PrintJob | null;
  queue: QueueSummary;
}

export interface LogEntry {
  ts: string;
  op: string;
  conn: ConnectionMode | null;
  jobId?: string;
  status: PrintJobStatus | "ok" | "error";
  message?: string;
  error?: PrinterError;
  meta?: Record<string, unknown>;
}

export interface TextPrintRequest extends SimulationOptions {
  text: string;
  language?: "tr" | "en" | string;
}

export interface ImagePrintRequest extends SimulationOptions {
  imageBase64?: string;
  imageUrl?: string;
  filename?: string;
}

export interface QrPrintRequest extends SimulationOptions {
  data: string;
}

export interface ReceiptItem {
  product: string;
  quantity: number;
  reward: number;
}

export interface ReceiptPrintRequest extends SimulationOptions {
  machineId: string;
  rewardName: string;
  currency?: string;
  issuedAt?: string;
  items: ReceiptItem[];
  qrPayload?: string;
}

export type PrintablePayload =
  | TextPrintRequest
  | ImagePrintRequest
  | QrPrintRequest
  | ReceiptPrintRequest;

export interface ReprintRequest {
  jobId: string;
}
