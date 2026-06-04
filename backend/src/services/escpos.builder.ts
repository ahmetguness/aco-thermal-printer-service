import type {
  ImagePrintPayload,
  PrinterCommandPayload,
  PrintJobType,
  PrintLanguage,
  QrPrintPayload,
  ReceiptPrintPayload,
  TextPrintPayload,
} from "../types/printer.types";

const CODE_PAGE_MAP: Record<PrintLanguage, string> = {
  tr: "CP857",
  en: "CP437",
};

const DEFAULT_LANGUAGE: PrintLanguage = "en";
const DEFAULT_CODE_PAGE = CODE_PAGE_MAP[DEFAULT_LANGUAGE];

export class EscposBuilder {
  buildText(payload: TextPrintPayload): PrinterCommandPayload {
    return this.build(
      "text",
      `text:${payload.text.slice(0, 40)}`,
      payload.text.length,
      payload.language,
    );
  }

  buildImage(payload: ImagePrintPayload): PrinterCommandPayload {
    const source = payload.filename ?? payload.imageUrl ?? "base64-image";
    const byteEstimate = payload.imageBase64?.length ?? payload.imageUrl?.length ?? source.length;
    return this.build("image", `image:${source}`, byteEstimate);
  }

  buildQr(payload: QrPrintPayload): PrinterCommandPayload {
    return this.build("qr", `qr:${payload.data.slice(0, 40)}`, payload.data.length);
  }

  buildReceipt(payload: ReceiptPrintPayload): PrinterCommandPayload {
    const total = payload.items.reduce((sum, item) => sum + item.reward, 0);
    const totalText = total.toFixed(2);
    const previewText = this.buildReceiptPreview(payload, totalText);

    return this.build(
      "receipt",
      `receipt:${payload.machineId}:items:${payload.items.length}:reward:${totalText}`,
      previewText.length,
      payload.language,
      previewText,
    );
  }

  private resolveCodePage(language: PrintLanguage): string {
    return CODE_PAGE_MAP[language] ?? DEFAULT_CODE_PAGE;
  }

  private build(
    kind: PrintJobType,
    summary: string,
    bytes: number,
    language?: PrintLanguage,
    previewText?: string,
  ): PrinterCommandPayload {
    const resolvedLanguage = language ?? DEFAULT_LANGUAGE;

    return {
      kind,
      generatedAt: new Date().toISOString(),
      summary,
      bytes,
      language: resolvedLanguage,
      codePage: this.resolveCodePage(resolvedLanguage),
      previewText,
    };
  }

  private buildReceiptPreview(payload: ReceiptPrintPayload, totalText: string): string {
    const currencySymbol = this.resolveCurrencySymbol(payload.currency);
    const issuedAt = payload.issuedAt ?? new Date().toISOString();
    const itemLines = payload.items.map(
      (item) =>
        `${item.product.padEnd(12, " ")} ${String(item.quantity).padStart(3, " ")} ${item.reward.toFixed(2)} ${currencySymbol}`,
    );

    return [
      "*** ACO RECYCLING ***",
      payload.rewardName,
      `Machine: ${payload.machineId}`,
      `Issued: ${issuedAt}`,
      "------------------------",
      "Item          Qty Reward",
      ...itemLines,
      "------------------------",
      `Reward: ${totalText} ${currencySymbol}`,
      payload.qrPayload ? `QR: ${payload.qrPayload}` : undefined,
      "THANK YOU",
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n");
  }

  private resolveCurrencySymbol(currency?: string): string {
    if (currency === "TRY" || currency === undefined) {
      return "₺";
    }

    return currency;
  }
}
