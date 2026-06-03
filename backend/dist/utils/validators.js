"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectionMode = isConnectionMode;
exports.isRecord = isRecord;
exports.isNonEmptyString = isNonEmptyString;
exports.isConnectRequestBody = isConnectRequestBody;
exports.isTextPrintPayload = isTextPrintPayload;
exports.isImagePrintPayload = isImagePrintPayload;
exports.isQrPrintPayload = isQrPrintPayload;
exports.isReceiptItem = isReceiptItem;
exports.isReceiptPrintPayload = isReceiptPrintPayload;
exports.isReprintRequestBody = isReprintRequestBody;
function isConnectionMode(value) {
    return value === "usb" || value === "lan";
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
    return isRecord(value) && isNonEmptyString(value.text);
}
function isImagePrintPayload(value) {
    if (!isRecord(value)) {
        return false;
    }
    const hasImageBase64 = value.imageBase64 === undefined || isNonEmptyString(value.imageBase64);
    const hasImageUrl = value.imageUrl === undefined || isNonEmptyString(value.imageUrl);
    const hasFilename = value.filename === undefined || isNonEmptyString(value.filename);
    const hasImageSource = isNonEmptyString(value.imageBase64) || isNonEmptyString(value.imageUrl);
    return hasImageBase64 && hasImageUrl && hasFilename && hasImageSource;
}
function isQrPrintPayload(value) {
    return isRecord(value) && isNonEmptyString(value.data);
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
        Array.isArray(value.items) &&
        value.items.every(isReceiptItem));
}
function isReprintRequestBody(value) {
    return isRecord(value) && isNonEmptyString(value.jobId);
}
