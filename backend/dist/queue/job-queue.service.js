"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueueService = exports.JobQueueService = void 0;
const node_crypto_1 = require("node:crypto");
class JobQueueService {
    jobs = new Map();
    createJob(type, payload, conn) {
        const now = new Date().toISOString();
        const job = {
            id: (0, node_crypto_1.randomUUID)(),
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
    getJob(jobId) {
        return this.jobs.get(jobId) ?? null;
    }
    updateJobStatus(jobId, status, error) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Print job not found: ${jobId}`);
        }
        const updatedJob = {
            ...job,
            status,
            updatedAt: new Date().toISOString(),
            error,
        };
        this.jobs.set(jobId, updatedJob);
        return updatedJob;
    }
    incrementAttempts(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Print job not found: ${jobId}`);
        }
        const updatedJob = {
            ...job,
            attempts: job.attempts + 1,
            updatedAt: new Date().toISOString(),
        };
        this.jobs.set(jobId, updatedJob);
        return updatedJob;
    }
    getLastJob() {
        return Array.from(this.jobs.values()).at(-1) ?? null;
    }
    getSummary() {
        const summary = {
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
exports.JobQueueService = JobQueueService;
exports.jobQueueService = new JobQueueService();
