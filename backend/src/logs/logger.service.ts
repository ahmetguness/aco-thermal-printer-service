import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ConnectionMode, PrinterError, PrintJobStatus } from "../types/printer.types";

export interface LogEntry {
  ts: string;
  op: string;
  conn: ConnectionMode | null;
  jobId?: string;
  status: PrintJobStatus | "ok" | "error";
  message?: string;
  error?: Pick<PrinterError, "code" | "detail" | "userMessage">;
  meta?: Record<string, unknown>;
}

export class LoggerService {
  private readonly logFilePath: string;

  constructor(logFilePath = path.resolve(process.cwd(), "storage", "logs.json")) {
    this.logFilePath = logFilePath;
  }

  async append(entry: Omit<LogEntry, "ts">): Promise<LogEntry> {
    const logEntry: LogEntry = {
      ts: new Date().toISOString(),
      ...entry,
    };

    const logs = await this.getAll();
    logs.push(logEntry);

    await mkdir(path.dirname(this.logFilePath), { recursive: true });
    await writeFile(this.logFilePath, `${JSON.stringify(logs, null, 2)}\n`, "utf8");

    return logEntry;
  }

  async getAll(): Promise<LogEntry[]> {
    try {
      const raw = await readFile(this.logFilePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return [];
      }

      throw error;
    }
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    );
  }
}

export const loggerService = new LoggerService();
