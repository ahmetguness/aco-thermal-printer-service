import { randomUUID } from "node:crypto";
import type {
  ConnectionMode,
  PrintablePayload,
  PrintJob,
  PrintJobStatus,
  PrintJobType,
  PrinterError,
  QueueSummary,
} from "../types/printer.types";

export class JobQueueService {
  private readonly jobs = new Map<string, PrintJob<PrintablePayload>>();

  createJob(
    type: PrintJobType,
    payload: PrintablePayload,
    conn: ConnectionMode | null,
  ): PrintJob<PrintablePayload> {
    const idempotencyKey = (payload as any).idempotencyKey;
    if (idempotencyKey) {
      const existing = Array.from(this.jobs.values()).find(
        (j) =>
          j.payload &&
          typeof j.payload === "object" &&
          "idempotencyKey" in j.payload &&
          (j.payload as any).idempotencyKey === idempotencyKey &&
          j.status !== "failed"
      );
      if (existing) {
        return existing;
      }
    }
    const now = new Date().toISOString();
    const job: PrintJob<PrintablePayload> = {
      id: randomUUID(),
      type,
      status: "queued",
      conn,
      payload,
      createdAt: now,
      updatedAt: now,
      attempts: 1,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(jobId: string): PrintJob<PrintablePayload> | null {
    return this.jobs.get(jobId) ?? null;
  }

  updateJobStatus(
    jobId: string,
    status: PrintJobStatus,
    error?: PrinterError,
  ): PrintJob<PrintablePayload> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Print job not found: ${jobId}`);
    }

    const updatedJob: PrintJob<PrintablePayload> = {
      ...job,
      status,
      updatedAt: new Date().toISOString(),
      error,
    };

    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  incrementAttempts(jobId: string): PrintJob<PrintablePayload> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Print job not found: ${jobId}`);
    }

    const updatedJob: PrintJob<PrintablePayload> = {
      ...job,
      attempts: job.attempts + 1,
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  getLastJob(): PrintJob<PrintablePayload> | null {
    return Array.from(this.jobs.values()).at(-1) ?? null;
  }

  getSummary(): QueueSummary {
    const summary: QueueSummary = {
      queued: 0,
      printing: 0,
      success: 0,
      failed: 0,
      total: this.jobs.size,
    };

    for (const job of this.jobs.values()) {
      summary[job.status] += 1;
    }

    return summary;
  }
}

export const jobQueueService = new JobQueueService();
