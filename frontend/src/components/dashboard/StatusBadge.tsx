import type { ConnectionState, PrintJobStatus } from "../../types/printer";

export type BadgeTone = ConnectionState | PrintJobStatus | "idle" | "loading" | "ready" | "error" | "ok";

interface StatusBadgeProps {
  tone: BadgeTone;
  label?: string;
}

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return <span className={`status-badge status-${tone}`}>{label ?? tone}</span>;
}

export function translateTone(tone: BadgeTone | undefined, language: "tr" | "en"): string {
  if (!tone) return "-";
  const translations: Record<string, { tr: string; en: string }> = {
    connected: { tr: "Bağlı", en: "Connected" },
    disconnected: { tr: "Bağlantı Yok", en: "Disconnected" },
    reconnecting: { tr: "Bağlanıyor", en: "Reconnecting" },
    loading: { tr: "Yükleniyor", en: "Loading" },
    ready: { tr: "Hazır", en: "Ready" },
    error: { tr: "Hata", en: "Error" },
    idle: { tr: "Boşta", en: "Idle" },
    success: { tr: "Başarılı", en: "Success" },
    failed: { tr: "Başarısız", en: "Failed" },
    queued: { tr: "Kuyrukta", en: "Queued" },
    printing: { tr: "Yazdırılıyor", en: "Printing" },
    ok: { tr: "OK", en: "OK" },
  };
  return translations[tone]?.[language] ?? tone.toUpperCase();
}
