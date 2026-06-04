"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printerService = exports.MockPrinterService = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const mock_printer_adapter_registry_1 = require("../adapters/mock-printer-adapter.registry");
const logger_service_1 = require("../logs/logger.service");
const job_queue_service_1 = require("../queue/job-queue.service");
const escpos_builder_1 = require("./escpos.builder");
const REPRINTABLE_JOB_STATUS = "failed";
class MockPrinterService {
    jobQueue;
    adapterRegistry;
    escposBuilder = new escpos_builder_1.EscposBuilder();
    failedImageDir = node_path_1.default.resolve(process.cwd(), "storage", "failed-images");
    activeAdapter;
    paperConsumedMm = 0;
    connection = {
        mode: null,
        state: "disconnected",
        reconnectAttempts: 0,
        nextReconnectAt: null,
        lastConnectedAt: null,
    };
    constructor(jobQueue = job_queue_service_1.jobQueueService, adapterRegistry = mock_printer_adapter_registry_1.mockPrinterAdapterRegistry) {
        this.jobQueue = jobQueue;
        this.adapterRegistry = adapterRegistry;
        this.activeAdapter = this.adapterRegistry.get("usb");
    }
    async connect(mode) {
        this.activeAdapter = this.adapterRegistry.get(mode);
        this.connection = await this.activeAdapter.connect();
        await logger_service_1.loggerService.append({
            op: "connect",
            conn: mode,
            status: "ok",
            message: `Connected through ${mode.toUpperCase()} mock adapter`,
        });
        return this.connection;
    }
    async printText(payload) {
        return this.print("text", payload);
    }
    async printImage(payload) {
        return this.print("image", payload);
    }
    async printQr(payload) {
        return this.print("qr", payload);
    }
    async printReceipt(payload) {
        return this.print("receipt", payload);
    }
    async reprint(jobId) {
        const originalJob = this.jobQueue.getJob(jobId);
        if (!originalJob) {
            throw new Error(`Print job not found: ${jobId}`);
        }
        if (originalJob.status !== REPRINTABLE_JOB_STATUS) {
            throw new Error(`Print job is not failed: ${jobId}`);
        }
        const reprintJob = await this.print(originalJob.type, originalJob.payload);
        await logger_service_1.loggerService.append({
            op: "reprint",
            conn: this.connection.mode,
            jobId: reprintJob.id,
            status: reprintJob.status,
            message: `Reprint requested for ${jobId}`,
            meta: { originalJobId: jobId },
        });
        return reprintJob;
    }
    getStatus() {
        const health = this.activeAdapter.getHealth();
        let remainingRollPercentage = Math.max(0, 100 - (this.paperConsumedMm / 50000) * 100);
        if (health.paper === "out") {
            remainingRollPercentage = 0;
        }
        else if (health.paper === "near_end") {
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
    setHealth(health) {
        if (health.paper === "ok") {
            this.paperConsumedMm = 0; // reset paper consumption on reload/paper change simulation
        }
        return this.activeAdapter.setHealth(health);
    }
    async simulateDisconnect() {
        await this.scheduleAutoReconnect();
        return this.connection;
    }
    async print(type, payload) {
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
        if (type === "text")
            this.paperConsumedMm += 12;
        else if (type === "image")
            this.paperConsumedMm += 75;
        else if (type === "qr")
            this.paperConsumedMm += 45;
        else if (type === "receipt")
            this.paperConsumedMm += 110;
        if (this.paperConsumedMm >= 50000) {
            this.activeAdapter.setHealth({ paper: "out" });
        }
        else if (this.paperConsumedMm >= 45000) {
            this.activeAdapter.setHealth({ paper: "near_end" });
        }
        await this.logJob(successJob, undefined, commandPayload);
        return successJob;
    }
    buildCommandPayload(type, payload) {
        switch (type) {
            case "text":
                return this.escposBuilder.buildText(payload);
            case "image":
                return this.escposBuilder.buildImage(payload);
            case "qr":
                return this.escposBuilder.buildQr(payload);
            case "receipt":
                return this.escposBuilder.buildReceipt(payload);
            default:
                return this.escposBuilder.buildText({ text: "UNKNOWN_COMMAND" });
        }
    }
    getBlockingError(payload) {
        const requestedError = payload.simulateError;
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
    createError(code) {
        const messages = {
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
    async scheduleAutoReconnect() {
        const previousMode = this.connection.mode;
        const schedule = this.activeAdapter.scheduleReconnect();
        this.connection = schedule.connection;
        await logger_service_1.loggerService.append({
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
    async completeReconnect(mode) {
        this.activeAdapter = this.adapterRegistry.get(mode);
        this.connection = await this.activeAdapter.connect();
        await logger_service_1.loggerService.append({
            op: "reconnect_success",
            conn: mode,
            status: "ok",
            message: `Reconnected through ${mode.toUpperCase()} mock adapter`,
        });
    }
    async logJob(job, error, commandPayload) {
        await logger_service_1.loggerService.append({
            op: `print_${job.type}`,
            conn: job.conn,
            jobId: job.id,
            status: error ? "error" : job.status,
            message: error ? error.userMessage : "Command payload generated by mock adapter",
            error,
            meta: commandPayload ? { commandPayload } : undefined,
        });
    }
    async persistFailedImageIfNeeded(job) {
        if (job.type !== "image") {
            return;
        }
        await (0, promises_1.mkdir)(this.failedImageDir, { recursive: true });
        await (0, promises_1.writeFile)(node_path_1.default.join(this.failedImageDir, `${job.id}.json`), `${JSON.stringify(job.payload, null, 2)}\n`, "utf8");
    }
}
exports.MockPrinterService = MockPrinterService;
exports.printerService = new MockPrinterService();
