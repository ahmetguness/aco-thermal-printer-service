import type { LogEntry } from "./logger.service";

const CSV_HEADERS = [
  "ts",
  "op",
  "conn",
  "jobId",
  "status",
  "message",
  "errorCode",
  "errorDetail",
  "errorUserMessage",
] as const;

type CsvHeader = (typeof CSV_HEADERS)[number];

export class LogExportService {
  toCsv(logs: LogEntry[]): string {
    const rows = logs.map((log) => this.toRow(log));
    return [CSV_HEADERS.join(","), ...rows].join("\n");
  }

  private toRow(log: LogEntry): string {
    const values: Record<CsvHeader, string> = {
      ts: log.ts,
      op: log.op,
      conn: log.conn ?? "",
      jobId: log.jobId ?? "",
      status: log.status,
      message: log.message ?? "",
      errorCode: log.error?.code ?? "",
      errorDetail: log.error?.detail ?? "",
      errorUserMessage: log.message ?? "",
    };

    return CSV_HEADERS.map((header) => this.escapeCsv(values[header])).join(",");
  }

  private escapeCsv(value: string): string {
    const escaped = value.replaceAll('"', '""');
    return `"${escaped}"`;
  }
}

export const logExportService = new LogExportService();
