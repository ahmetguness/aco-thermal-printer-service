import type { PrintLanguage, ReceiptItem, ReceiptPrintRequest } from "../types/printer";

const SAMPLE_MACHINE_ID = "ACO-TEST-0001-0001";
const SAMPLE_ISSUED_AT = "2025-09-16T16:19:02.000Z";
const SAMPLE_CURRENCY = "TRY";

export const sampleReceiptItems: ReceiptItem[] = [
  { product: "Glass", quantity: 0, reward: 0 },
  { product: "Plastic", quantity: 2, reward: 2 },
  { product: "Metal", quantity: 1, reward: 1 },
  { product: "Tetrapak", quantity: 0, reward: 0 },
];

export function createSampleReceipt(language: PrintLanguage): ReceiptPrintRequest {
  const total = getReceiptTotal(sampleReceiptItems);

  return {
    machineId: SAMPLE_MACHINE_ID,
    rewardName: "Aco Recycling Default Reward",
    currency: SAMPLE_CURRENCY,
    issuedAt: SAMPLE_ISSUED_AT,
    items: sampleReceiptItems,
    qrPayload: buildReceiptQrPayload(SAMPLE_MACHINE_ID, SAMPLE_ISSUED_AT, total, SAMPLE_CURRENCY),
    language,
  };
}

export function getReceiptTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => sum + item.reward, 0);
}

export function formatReceiptReward(value: number, currency?: string): string {
  return `${value.toFixed(2)} ${resolveCurrencySymbol(currency)}`;
}

export function formatReceiptIssuedAt(value: string, language: PrintLanguage): string {
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function buildReceiptQrPayload(machineId: string, issuedAt: string, reward: number, currency: string): string {
  return `ACO|${machineId}|${issuedAt}|${reward.toFixed(2)}|${currency}`;
}

function resolveCurrencySymbol(currency?: string): string {
  if (currency === "TRY" || currency === undefined) {
    return "₺";
  }

  return currency;
}
