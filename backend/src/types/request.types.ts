import type {
  ConnectionMode,
  ImagePrintPayload,
  PrinterHealth,
  QrPrintPayload,
  ReceiptPrintPayload,
  TextPrintPayload,
} from "./printer.types";

export interface ConnectRequestBody {
  mode: ConnectionMode;
}

export interface PrintTextRequestBody extends TextPrintPayload {}

export interface PrintImageRequestBody extends ImagePrintPayload {}

export interface PrintQrRequestBody extends QrPrintPayload {}

export interface PrintReceiptRequestBody extends ReceiptPrintPayload {}

export interface ReprintRequestBody {
  jobId: string;
}

export interface SetMockHealthRequestBody extends Partial<PrinterHealth> {}
