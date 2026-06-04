import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { mockPrinterAdapterRegistry, type MockPrinterAdapterRegistry } from "../adapters/mock-printer-adapter.registry";
import type { MockPrinterAdapter } from "../adapters/mock-printer.adapter";
import { loggerService } from "../logs/logger.service";
import { jobQueueService, type JobQueueService } from "../queue/job-queue.service";
import { EscposBuilder } from "./escpos.builder";
import type {
  ConnectionInfo,
  ConnectionMode,
  ImagePrintPayload,
  PrintablePayload,
  PrintJob,
  PrintJobType,
  PrinterCommandPayload,
  PrinterError,
  PrinterErrorCode,
  PrinterStatus,
  QrPrintPayload,
  ReceiptPrintPayload,
  TextPrintPayload,
} from "../types/printer.types";

type SimulatablePayload = PrintablePayload & {
  simulateError?: PrinterErrorCode;
};

const REPRINTABLE_JOB_STATUS = "failed";

export class MockPrinterService {
  private readonly escposBuilder = new EscposBuilder();
  private readonly failedImageDir = path.resolve(process.cwd(), "storage", "failed-images");
  private activeAdapter: MockPrinterAdapter;
  private paperConsumedMm = 0;
  private connection: ConnectionInfo = {
    mode: null,
    state: "disconnected",
    reconnectAttempts: 0,
    nextReconnectAt: null,
    lastConnectedAt: null,
  };

  constructor(
    private readonly jobQueue: JobQueueService = jobQueueService,
    private readonly adapterRegistry: MockPrinterAdapterRegistry = mockPrinterAdapterRegistry,
  ) {
    this.activeAdapter = this.adapterRegistry.get("usb");
  }

  async connect(mode: ConnectionMode): Promise<ConnectionInfo> {
    this.activeAdapter = this.adapterRegistry.get(mode);
    this.connection = await this.activeAdapter.connect();

    await loggerService.append({
      op: "connect",
      conn: mode,
      status: "ok",
      message: `Connected through ${mode.toUpperCase()} mock adapter`,
    });

    return this.connection;
  }

  async printText(payload: TextPrintPayload): Promise<PrintJob<PrintablePayload>> {
    return this.print("text", payload);
  }

  async printImage(payload: ImagePrintPayload): Promise<PrintJob<PrintablePayload>> {
    return this.print("image", payload);
  }

  async printQr(payload: QrPrintPayload): Promise<PrintJob<PrintablePayload>> {
    return this.print("qr", payload);
  }

  async printReceipt(payload: ReceiptPrintPayload): Promise<PrintJob<PrintablePayload>> {
    return this.print("receipt", payload);
  }

  async reprint(jobId: string): Promise<PrintJob<PrintablePayload>> {
    const originalJob = this.jobQueue.getJob(jobId);

    if (!originalJob) {
      throw new Error(`Print job not found: ${jobId}`);
    }

    if (originalJob.status !== REPRINTABLE_JOB_STATUS) {
      throw new Error(`Print job is not failed: ${jobId}`);
    }

    const reprintJob = await this.print(originalJob.type, originalJob.payload);

    await loggerService.append({
      op: "reprint",
      conn: this.connection.mode,
      jobId: reprintJob.id,
      status: reprintJob.status,
      message: `Reprint requested for ${jobId}`,
      meta: { originalJobId: jobId },
    });

    return reprintJob;
  }

  getStatus(): PrinterStatus {
    const health = this.activeAdapter.getHealth();
    
    let remainingRollPercentage = Math.max(0, 100 - (this.paperConsumedMm / 50000) * 100);
    if (health.paper === "out") {
      remainingRollPercentage = 0;
    } else if (health.paper === "near_end") {
      remainingRollPercentage = Math.min(10, remainingRollPercentage);
    }
    
    const remainingRollMeters = parseFloat(((50000 * (remainingRollPercentage / 100)) / 1000).toFixed(2));
    
    const queueSummary = this.jobQueue.getSummary();
    const pendingJobsCount = queueSummary.queued + queueSummary.printing;
    const printEtaSeconds = parseFloat((pendingJobsCount * 1.2).toFixed(1));

    return {
      connection: this.connection,
      health,
      lastJob: this.jobQueue.getLastJob(),
      queue: queueSummary,
      predictions: {
        remainingRollPercentage: parseFloat(remainingRollPercentage.toFixed(1)),
        remainingRollMeters,
        printEtaSeconds,
      },
    };
  }

  setHealth(health: Parameters<MockPrinterAdapter["setHealth"]>[0]): ReturnType<MockPrinterAdapter["setHealth"]> {
    if (health.paper === "ok") {
      this.paperConsumedMm = 0; // reset paper consumption on reload/paper change simulation
    }
    return this.activeAdapter.setHealth(health);
  }

  async simulateDisconnect(): Promise<ConnectionInfo> {
    await this.scheduleAutoReconnect();

    return this.connection;
  }

  private async print(
    type: PrintJobType,
    payload: PrintablePayload,
  ): Promise<PrintJob<PrintablePayload>> {
    const job = this.jobQueue.createJob(type, payload, this.connection.mode);

    if (job.status !== "queued") {
      return job;
    }

    const error = this.getBlockingError(payload);

    if (error) {
      if (error.code === "COMM_ERROR") {
        await this.scheduleAutoReconnect();
      }

      const failedJob = this.jobQueue.updateJobStatus(job.id, "failed", error);
      await this.persistFailedImageIfNeeded(failedJob);
      await this.logJob(failedJob, error);
      return failedJob;
    }

    this.jobQueue.updateJobStatus(job.id, "printing");
    const commandPayload = this.buildCommandPayload(type, payload);
    const adapterResult = await this.activeAdapter.send(commandPayload);

    if (!adapterResult.success) {
      if (adapterResult.error.code === "COMM_ERROR") {
        await this.scheduleAutoReconnect();
      }

      const failedJob = this.jobQueue.updateJobStatus(job.id, "failed", adapterResult.error);
      await this.persistFailedImageIfNeeded(failedJob);
      await this.logJob(failedJob, adapterResult.error, commandPayload);
      return failedJob;
    }

    const successJob = this.jobQueue.updateJobStatus(job.id, "success");

    // Consume paper
    if (type === "text") this.paperConsumedMm += 12;
    else if (type === "image") this.paperConsumedMm += 75;
    else if (type === "qr") this.paperConsumedMm += 45;
    else if (type === "receipt") this.paperConsumedMm += 110;

    if (this.paperConsumedMm >= 50000) {
      this.activeAdapter.setHealth({ paper: "out" });
    } else if (this.paperConsumedMm >= 45000) {
      this.activeAdapter.setHealth({ paper: "near_end" });
    }

    await this.logJob(successJob, undefined, commandPayload);

    return successJob;
  }

  private buildCommandPayload(type: PrintJobType, payload: PrintablePayload): PrinterCommandPayload {
    switch (type) {
      case "text":
        return this.escposBuilder.buildText(payload as TextPrintPayload);
      case "image":
        return this.escposBuilder.buildImage(payload as ImagePrintPayload);
      case "qr":
        return this.escposBuilder.buildQr(payload as QrPrintPayload);
      case "receipt":
        return this.escposBuilder.buildReceipt(payload as ReceiptPrintPayload);
      default:
        return this.escposBuilder.buildText({ text: "UNKNOWN_COMMAND" });
    }
  }

  private getBlockingError(payload: PrintablePayload): PrinterError | undefined {
    const requestedError = (payload as SimulatablePayload).simulateError;

    if (requestedError) {
      return this.createError(requestedError);
    }

    if (this.connection.state !== "connected" || !this.connection.mode) {
      return this.createError("COMM_ERROR");
    }

    const health = this.activeAdapter.getHealth();

    if (health.paper === "out") {
      return this.createError("PAPER_OUT");
    }

    if (health.cover === "open") {
      return this.createError("COVER_OPEN");
    }

    if (health.temperature === "overheat") {
      return this.createError("OVERHEAT");
    }

    return undefined;
  }

  private createError(code: PrinterErrorCode): PrinterError {
    const messages: Record<PrinterErrorCode, PrinterError> = {
      PAPER_OUT: {
        code,
        detail: "No paper detected",
        userMessage: "Printer paper is out. Please insert a new roll.",
      },
      PAPER_JAM: {
        code,
        detail: "Paper path is blocked",
        userMessage: "Paper jam detected. Please clear the paper path.",
      },
      COVER_OPEN: {
        code,
        detail: "Printer cover is open",
        userMessage: "Printer cover is open. Please close it before printing.",
      },
      OVERHEAT: {
        code,
        detail: "Print head temperature is too high",
        userMessage: "Printer is overheated. Please wait before retrying.",
      },
      COMM_ERROR: {
        code,
        detail: "Printer communication failed",
        userMessage: "Printer connection failed. The service will retry automatically.",
      },
      UNKNOWN_COMMAND: {
        code,
        detail: "Unsupported printer command",
        userMessage: "The printer command is not supported.",
      },
    };

    return messages[code];
  }

  private async scheduleAutoReconnect(): Promise<void> {
    const previousMode = this.connection.mode;
    const schedule = this.activeAdapter.scheduleReconnect();
    this.connection = schedule.connection;

    await loggerService.append({
      op: "reconnect_scheduled",
      conn: previousMode,
      status: "error",
      message: `Connection lost. Reconnect scheduled in ${schedule.delayMs}ms`,
      error: this.createError("COMM_ERROR"),
      meta: {
        nextReconnectAt: schedule.connection.nextReconnectAt,
        reconnectAttempts: schedule.connection.reconnectAttempts,
      },
    });

    if (!previousMode) {
      return;
    }

    setTimeout(() => {
      void this.completeReconnect(previousMode);
    }, schedule.delayMs);
  }

  private async completeReconnect(mode: ConnectionMode): Promise<void> {
    this.activeAdapter = this.adapterRegistry.get(mode);
    this.connection = await this.activeAdapter.connect();

    await loggerService.append({
      op: "reconnect_success",
      conn: mode,
      status: "ok",
      message: `Reconnected through ${mode.toUpperCase()} mock adapter`,
    });
  }

  private async logJob(
    job: PrintJob<PrintablePayload>,
    error?: PrinterError,
    commandPayload?: PrinterCommandPayload,
  ): Promise<void> {
    await loggerService.append({
      op: `print_${job.type}`,
      conn: job.conn,
      jobId: job.id,
      status: error ? "error" : job.status,
      message: error ? error.userMessage : "Command payload generated by mock adapter",
      error,
      meta: commandPayload ? { commandPayload } : undefined,
    });
  }

  private async persistFailedImageIfNeeded(job: PrintJob<PrintablePayload>): Promise<void> {
    if (job.type !== "image") {
      return;
    }

    await mkdir(this.failedImageDir, { recursive: true });
    await writeFile(
      path.join(this.failedImageDir, `${job.id}.json`),
      `${JSON.stringify(job.payload, null, 2)}\n`,
      "utf8",
    );
  }
}

export const printerService = new MockPrinterService();
