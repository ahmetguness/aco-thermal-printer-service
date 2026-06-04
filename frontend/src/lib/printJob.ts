import type { PrintJob, PrinterError, PrinterErrorCode } from "../types/printer";

export function assertPrintJobSucceeded(job: PrintJob, language: "tr" | "en"): void {
  if (job.status !== "failed") {
    return;
  }

  throw new Error(formatFailedPrintJobMessage(job, language));
}

function formatFailedPrintJobMessage(job: PrintJob, language: "tr" | "en"): string {
  const fallback =
    language === "tr"
      ? "Yazdırma işi başarısız oldu."
      : "Print job failed.";

  if (!job.error) {
    return `${fallback} ${language === "tr" ? "İş ID" : "Job ID"}: ${job.id}`;
  }

  return `${job.error.code}: ${translatePrinterError(job.error, language)}`;
}

function translatePrinterError(error: PrinterError, language: "tr" | "en"): string {
  const messages: Record<PrinterErrorCode, { tr: string; en: string }> = {
    PAPER_OUT: {
      tr: "Yazıcıda kağıt bitti. Lütfen yeni rulo takın ve tekrar deneyin.",
      en: "Printer paper is out. Insert a new roll and try again.",
    },
    PAPER_JAM: {
      tr: "Kağıt sıkışması algılandı. Lütfen kağıt yolunu temizleyin.",
      en: "Paper jam detected. Clear the paper path and try again.",
    },
    COVER_OPEN: {
      tr: "Yazıcı kapağı açık. Yazdırmadan önce kapağı kapatın.",
      en: "Printer cover is open. Close it before printing.",
    },
    OVERHEAT: {
      tr: "Yazıcı aşırı ısındı. Lütfen soğumasını bekleyin.",
      en: "Printer is overheated. Wait before retrying.",
    },
    COMM_ERROR: {
      tr: "Yazıcı bağlantısı kurulamadı. Sistem otomatik yeniden bağlanmayı deneyecek.",
      en: "Printer connection failed. The service will retry automatically.",
    },
    UNKNOWN_COMMAND: {
      tr: "Yazıcı komutu desteklenmiyor.",
      en: "The printer command is not supported.",
    },
  };

  return messages[error.code]?.[language] ?? error.userMessage ?? error.detail;
}
