import type { LogEntry } from "../../types/printer";
import { exportLogsCsv } from "../../lib/api";

interface LogsPanelProps {
  logs: LogEntry[];
  language: "tr" | "en";
}

export function LogsPanel({ logs, language }: LogsPanelProps) {
  const handleExport = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const blob = await exportLogsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "logs.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(language === "tr" ? "Günlükler dışa aktarılamadı." : "Failed to export logs.");
    }
  };

  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>{language === "tr" ? "Sistem Günlükleri (Logs)" : "System Logs"}</h2>
        <a className="link-button" href="#" onClick={handleExport}>
          {language === "tr" ? "CSV Dışa Aktar" : "Export CSV"}
        </a>
      </div>
      <div className="log-list">
        {logs.length === 0 ? (
          <div className="empty-state">{language === "tr" ? "Henüz log kaydı yok" : "No logs yet"}</div>
        ) : (
          logs.map((log) => (
            <LogRow log={log} language={language} key={`${log.ts}-${log.op}-${log.jobId ?? "system"}`} />
          ))
        )}
      </div>
    </section>
  );
}

function LogRow({ log, language }: { log: LogEntry; language: "tr" | "en" }) {
  const status = getStrictLogStatus(log, language);
  const isError = status.tone === "error";
  const rowClassName = isError ? "log-row log-row-error" : "log-row";

  return (
    <div className={rowClassName}>
      <span>{formatLogTime(log.ts)}</span>
      <strong>{log.op}</strong>
      <span className={`log-pill log-pill-${status.tone}`}>
        {status.label}
      </span>
      <span title={log.error?.detail ?? log.message ?? ""}>{log.error?.code ? translateErrorCode(log.error.code, language) : (log.message ?? "-")}</span>
    </div>
  );
}

function getStrictLogStatus(log: LogEntry, language: "tr" | "en"): { label: string; tone: "success" | "warning" | "error" } {
  if (log.error || log.status === "error") {
    return {
      label: language === "tr" ? "HATA" : "ERROR",
      tone: "error",
    };
  }

  if (log.status === "failed") {
    return {
      label: language === "tr" ? "BAŞARISIZ" : "FAILED",
      tone: "error",
    };
  }

  if (log.status === "queued" || log.status === "printing") {
    return {
      label:
        log.status === "queued"
          ? (language === "tr" ? "KUYRUKTA" : "QUEUED")
          : (language === "tr" ? "YAZDIRILIYOR" : "PRINTING"),
      tone: "warning",
    };
  }

  return {
    label: language === "tr" ? "BAŞARILI" : "SUCCESS",
    tone: "success",
  };
}

function formatLogTime(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function translateErrorCode(code: string, language: "tr" | "en"): string {
  const codes: Record<string, { tr: string; en: string }> = {
    PAPER_OUT: { tr: "KAĞIT BİTTİ", en: "PAPER OUT" },
    PAPER_JAM: { tr: "KAĞIT SIKIŞMASI", en: "PAPER JAM" },
    COVER_OPEN: { tr: "KAPAK AÇIK", en: "COVER OPEN" },
    OVERHEAT: { tr: "AŞIRI ISINMA", en: "OVERHEAT" },
    COMM_ERROR: { tr: "İLETİŞİM HATASI", en: "COMMUNICATION ERROR" },
    UNKNOWN_COMMAND: { tr: "BİLİNMEYEN KOMUT", en: "UNKNOWN COMMAND" },
  };
  return codes[code]?.[language] ?? code;
}
