import type {
  ConnectionMode,
  ImagePrintPayload,
  PrinterErrorCode,
  QrPrintPayload,
  ReceiptItem,
  ReceiptPrintPayload,
  TextPrintPayload,
} from "../types/printer.types";
import type {
  ConnectRequestBody,
  ReprintRequestBody,
  SetMockHealthRequestBody,
} from "../types/request.types";

export function isConnectionMode(value: unknown): value is ConnectionMode {
  return value === "usb" || value === "lan";
}

export function isPrinterErrorCode(value: unknown): value is PrinterErrorCode {
  return (
    value === "PAPER_OUT" ||
    value === "PAPER_JAM" ||
    value === "COVER_OPEN" ||
    value === "OVERHEAT" ||
    value === "COMM_ERROR" ||
    value === "UNKNOWN_COMMAND"
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isConnectRequestBody(value: unknown): value is ConnectRequestBody {
  return isRecord(value) && isConnectionMode(value.mode);
}

export function isTextPrintPayload(value: unknown): value is TextPrintPayload {
  return isRecord(value) && isNonEmptyString(value.text) && hasValidSimulationOptions(value);
}

export function isImagePrintPayload(value: unknown): value is ImagePrintPayload {
  if (!isRecord(value)) {
    return false;
  }

  const hasImageBase64 = value.imageBase64 === undefined || isNonEmptyString(value.imageBase64);
  const hasImageUrl = value.imageUrl === undefined || isNonEmptyString(value.imageUrl);
  const hasFilename = value.filename === undefined || isNonEmptyString(value.filename);
  const hasImageSource = isNonEmptyString(value.imageBase64) || isNonEmptyString(value.imageUrl);

  return hasImageBase64 && hasImageUrl && hasFilename && hasImageSource && hasValidSimulationOptions(value);
}

export function isQrPrintPayload(value: unknown): value is QrPrintPayload {
  return isRecord(value) && isNonEmptyString(value.data) && hasValidSimulationOptions(value);
}

export function isReceiptItem(value: unknown): value is ReceiptItem {
  return (
    isRecord(value) &&
    isNonEmptyString(value.product) &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity >= 0 &&
    typeof value.reward === "number" &&
    Number.isFinite(value.reward) &&
    value.reward >= 0
  );
}

export function isReceiptPrintPayload(value: unknown): value is ReceiptPrintPayload {
  return (
    isRecord(value) &&
    isNonEmptyString(value.machineId) &&
    isNonEmptyString(value.rewardName) &&
    (value.currency === undefined || isNonEmptyString(value.currency)) &&
    (value.issuedAt === undefined || isNonEmptyString(value.issuedAt)) &&
    (value.qrPayload === undefined || isNonEmptyString(value.qrPayload)) &&
    Array.isArray(value.items) &&
    value.items.every(isReceiptItem) &&
    hasValidSimulationOptions(value)
  );
}

export function isReprintRequestBody(value: unknown): value is ReprintRequestBody {
  return isRecord(value) && isNonEmptyString(value.jobId);
}

export function isSetMockHealthRequestBody(value: unknown): value is SetMockHealthRequestBody {
  if (!isRecord(value)) {
    return false;
  }

  const validPaper = value.paper === undefined || value.paper === "ok" || value.paper === "out" || value.paper === "near_end";
  const validCover = value.cover === undefined || value.cover === "closed" || value.cover === "open";
  const validTemperature =
    value.temperature === undefined || value.temperature === "normal" || value.temperature === "overheat";
  const hasAtLeastOneField =
    value.paper !== undefined || value.cover !== undefined || value.temperature !== undefined;

  return validPaper && validCover && validTemperature && hasAtLeastOneField;
}

function hasValidSimulationOptions(value: Record<string, unknown>): boolean {
  return value.simulateError === undefined || isPrinterErrorCode(value.simulateError);
}
