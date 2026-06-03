"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printerService = exports.MockPrinterService = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const logger_service_1 = require("../logs/logger.service");
const job_queue_service_1 = require("../queue/job-queue.service");
const escpos_builder_1 = require("./escpos.builder");
const mock_printer_adapter_1 = require("./mock-printer.adapter");
class MockPrinterService {
    jobQueue;
    adapter;
    escposBuilder = new escpos_builder_1.EscposBuilder();
    failedImageDir = node_path_1.default.resolve(process.cwd(), "storage", "failed-images");
    connection = {
        mode: null,
        state: "disconnected",
        reconnectAttempts: 0,
        nextReconnectAt: null,
        lastConnectedAt: null,
    };
    constructor(jobQueue = job_queue_service_1.jobQueueService, adapter = mock_printer_adapter_1.mockPrinterAdapter) {
        this.jobQueue = jobQueue;
        this.adapter = adapter;
    }
    async connect(mode) {
        this.connection = await this.adapter.connect(mode);
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
        return {
            connection: this.connection,
            health: this.adapter.getHealth(),
            lastJob: this.jobQueue.getLastJob(),
            queue: this.jobQueue.getSummary(),
        };
    }
    setHealth(health) {
        return this.adapter.setHealth(health);
    }
    async simulateDisconnect() {
        const previousMode = this.connection.mode;
        this.connection = this.adapter.scheduleReconnect();
        await logger_service_1.loggerService.append({
            op: "reconnect_scheduled",
            conn: previousMode,
            status: "error",
            message: "Connection lost. Reconnect scheduled by mock adapter",
            error: this.createError("COMM_ERROR"),
        });
        return this.connection;
    }
    async print(type, payload) {
        const job = this.jobQueue.createJob(type, payload, this.connection.mode);
        const error = this.getBlockingError(payload);
        if (error) {
            const failedJob = this.jobQueue.updateJobStatus(job.id, "failed", error);
            await this.persistFailedImageIfNeeded(failedJob);
            await this.logJob(failedJob, error);
            return failedJob;
        }
        this.jobQueue.updateJobStatus(job.id, "printing");
        const commandPayload = this.buildCommandPayload(type, payload);
        const adapterResult = await this.adapter.send(commandPayload);
        if (!adapterResult.success) {
            const failedJob = this.jobQueue.updateJobStatus(job.id, "failed", adapterResult.error);
            await this.persistFailedImageIfNeeded(failedJob);
            await this.logJob(failedJob, adapterResult.error, commandPayload);
            return failedJob;
        }
        const successJob = this.jobQueue.updateJobStatus(job.id, "success");
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
        const health = this.adapter.getHealth();
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
