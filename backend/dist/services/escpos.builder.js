"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscposBuilder = void 0;
class EscposBuilder {
    buildText(payload) {
        return this.build("text", `text:${payload.text.slice(0, 40)}`, payload.text.length);
    }
    buildImage(payload) {
        const source = payload.filename ?? payload.imageUrl ?? "base64-image";
        const byteEstimate = payload.imageBase64?.length ?? payload.imageUrl?.length ?? source.length;
        return this.build("image", `image:${source}`, byteEstimate);
    }
    buildQr(payload) {
        return this.build("qr", `qr:${payload.data.slice(0, 40)}`, payload.data.length);
    }
    buildReceipt(payload) {
        const total = payload.items.reduce((sum, item) => sum + item.reward, 0);
        return this.build("receipt", `receipt:${payload.machineId}:reward:${total}`, payload.items.length * 48);
    }
    build(kind, summary, bytes) {
        return {
            kind,
            generatedAt: new Date().toISOString(),
            summary,
            bytes,
        };
    }
}
exports.EscposBuilder = EscposBuilder;
