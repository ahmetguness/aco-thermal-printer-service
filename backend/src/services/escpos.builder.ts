import type {
  ImagePrintPayload,
  PrinterCommandPayload,
  PrintJobType,
  QrPrintPayload,
  ReceiptPrintPayload,
  TextPrintPayload,
} from "../types/printer.types";

export class EscposBuilder {
  buildText(payload: TextPrintPayload): PrinterCommandPayload {
    return this.build("text", `text:${payload.text.slice(0, 40)}`, payload.text.length);
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
    return this.build("receipt", `receipt:${payload.machineId}:reward:${total}`, payload.items.length * 48);
  }

  private build(kind: PrintJobType, summary: string, bytes: number): PrinterCommandPayload {
    return {
      kind,
      generatedAt: new Date().toISOString(),
      summary,
      bytes,
    };
  }
}
