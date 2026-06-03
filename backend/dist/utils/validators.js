"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectionMode = isConnectionMode;
exports.isPrinterErrorCode = isPrinterErrorCode;
exports.isPrintLanguage = isPrintLanguage;
exports.isRecord = isRecord;
exports.isNonEmptyString = isNonEmptyString;
exports.isConnectRequestBody = isConnectRequestBody;
exports.isTextPrintPayload = isTextPrintPayload;
exports.isImagePrintPayload = isImagePrintPayload;
exports.isQrPrintPayload = isQrPrintPayload;
exports.isReceiptItem = isReceiptItem;
exports.isReceiptPrintPayload = isReceiptPrintPayload;
exports.isReprintRequestBody = isReprintRequestBody;
exports.isSetMockHealthRequestBody = isSetMockHealthRequestBody;
function isConnectionMode(value) {
    return value === "usb" || value === "lan";
}
function isPrinterErrorCode(value) {
    return (value === "PAPER_OUT" ||
        value === "PAPER_JAM" ||
        value === "COVER_OPEN" ||
        value === "OVERHEAT" ||
        value === "COMM_ERROR" ||
        value === "UNKNOWN_COMMAND");
}
function isPrintLanguage(value) {
    return value === "tr" || value === "en";
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isConnectRequestBody(value) {
    return isRecord(value) && isConnectionMode(value.mode);
}
function isTextPrintPayload(value) {
    return (isRecord(value) &&
        isNonEmptyString(value.text) &&
        (value.language === undefined || isPrintLanguage(value.language)) &&
        hasValidSimulationOptions(value));
}
function isImagePrintPayload(value) {
    if (!isRecord(value)) {
        return false;
    }
    const hasImageBase64 = value.imageBase64 === undefined || isNonEmptyString(value.imageBase64);
    const hasImageUrl = value.imageUrl === undefined || isNonEmptyString(value.imageUrl);
    const hasFilename = value.filename === undefined || isNonEmptyString(value.filename);
    const hasImageSource = isNonEmptyString(value.imageBase64) || isNonEmptyString(value.imageUrl);
    return hasImageBase64 && hasImageUrl && hasFilename && hasImageSource && hasValidSimulationOptions(value);
}
function isQrPrintPayload(value) {
    return isRecord(value) && isNonEmptyString(value.data) && hasValidSimulationOptions(value);
}
function isReceiptItem(value) {
    return (isRecord(value) &&
        isNonEmptyString(value.product) &&
        typeof value.quantity === "number" &&
        Number.isFinite(value.quantity) &&
        value.quantity >= 0 &&
        typeof value.reward === "number" &&
        Number.isFinite(value.reward) &&
        value.reward >= 0);
}
function isReceiptPrintPayload(value) {
    return (isRecord(value) &&
        isNonEmptyString(value.machineId) &&
        isNonEmptyString(value.rewardName) &&
        (value.currency === undefined || isNonEmptyString(value.currency)) &&
        (value.issuedAt === undefined || isNonEmptyString(value.issuedAt)) &&
        (value.qrPayload === undefined || isNonEmptyString(value.qrPayload)) &&
        (value.language === undefined || isPrintLanguage(value.language)) &&
        Array.isArray(value.items) &&
        value.items.every(isReceiptItem) &&
        hasValidSimulationOptions(value));
}
function isReprintRequestBody(value) {
    return isRecord(value) && isNonEmptyString(value.jobId);
}
function isSetMockHealthRequestBody(value) {
    if (!isRecord(value)) {
        return false;
    }
    const validPaper = value.paper === undefined || value.paper === "ok" || value.paper === "out" || value.paper === "near_end";
    const validCover = value.cover === undefined || value.cover === "closed" || value.cover === "open";
    const validTemperature = value.temperature === undefined || value.temperature === "normal" || value.temperature === "overheat";
    const hasAtLeastOneField = value.paper !== undefined || value.cover !== undefined || value.temperature !== undefined;
    return validPaper && validCover && validTemperature && hasAtLeastOneField;
}
function hasValidSimulationOptions(value) {
    return value.simulateError === undefined || isPrinterErrorCode(value.simulateError);
}
