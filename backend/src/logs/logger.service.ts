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
  error?: {
    code: string;
    detail: string;
    userMessage?: string;
  };
  meta?: Record<string, unknown>;
}

export class LoggerService {
  private readonly logFilePath: string;
  private logsCache: LogEntry[] | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(logFilePath = path.resolve(process.cwd(), "storage", "logs.json")) {
    this.logFilePath = logFilePath;
  }

  async append(entry: Omit<LogEntry, "ts" | "error"> & { error?: { code: string; detail: string; userMessage?: string } }): Promise<LogEntry> {
    const errorDetails = entry.error
      ? { code: entry.error.code, detail: entry.error.detail, userMessage: entry.error.userMessage }
      : undefined;

    const logEntry: LogEntry = {
      ts: new Date().toISOString(),
      ...entry,
      error: errorDetails,
    };

    const logs = await this.getAll();
    logs.push(logEntry);

    await this.persist(logs);

    return logEntry;
  }

  async getAll(): Promise<LogEntry[]> {
    if (this.logsCache !== null) {
      return this.logsCache;
    }

    try {
      const raw = await readFile(this.logFilePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      this.logsCache = Array.isArray(parsed) ? this.normalizeLogEntries(parsed) : [];
      return this.logsCache;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        this.logsCache = [];
        return this.logsCache;
      }

      throw error;
    }
  }

  private async persist(logs: LogEntry[]): Promise<void> {
    const writeOperation = this.writeQueue.then(async () => {
      await mkdir(path.dirname(this.logFilePath), { recursive: true });
      await writeFile(this.logFilePath, `${JSON.stringify(logs, null, 2)}\n`, "utf8");
    });

    this.writeQueue = writeOperation.catch(() => undefined);

    await writeOperation;
  }

  private normalizeLogEntries(values: unknown[]): LogEntry[] {
    return values.filter((value): value is LogEntry => this.isLogEntry(value));
  }

  private isLogEntry(value: unknown): value is LogEntry {
    return (
      typeof value === "object" &&
      value !== null &&
      "ts" in value &&
      "op" in value &&
      "conn" in value &&
      "status" in value &&
      typeof value.ts === "string" &&
      typeof value.op === "string" &&
      (typeof value.conn === "string" || value.conn === null) &&
      typeof value.status === "string"
    );
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
