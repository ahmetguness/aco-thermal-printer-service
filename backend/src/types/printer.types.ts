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

export interface TextPrintPayload {
  text: string;
  language?: "tr" | "en" | string;
}

export interface ImagePrintPayload {
  imageBase64?: string;
  imageUrl?: string;
  filename?: string;
}

export interface QrPrintPayload {
  data: string;
}

export interface ReceiptItem {
  product: string;
  quantity: number;
  reward: number;
}

export interface ReceiptPrintPayload {
  machineId: string;
  rewardName: string;
  currency?: string;
  issuedAt?: string;
  items: ReceiptItem[];
  qrPayload?: string;
}

export type PrintablePayload =
  | TextPrintPayload
  | ImagePrintPayload
  | QrPrintPayload
  | ReceiptPrintPayload;

export interface PrinterCommandPayload {
  kind: PrintJobType;
  generatedAt: string;
  summary: string;
  bytes: number;
}

export type PrinterAdapterResult =
  | {
      success: true;
      message: string;
      command: PrinterCommandPayload;
    }
  | {
      success: false;
      error: PrinterError;
      command: PrinterCommandPayload;
    };

export interface PrinterAdapter {
  connect(mode: ConnectionMode): Promise<ConnectionInfo>;
  send(command: PrinterCommandPayload): Promise<PrinterAdapterResult>;
  getHealth(): PrinterHealth;
}
