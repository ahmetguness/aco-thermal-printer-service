"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerService = exports.LoggerService = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
class LoggerService {
    logFilePath;
    constructor(logFilePath = node_path_1.default.resolve(process.cwd(), "storage", "logs.json")) {
        this.logFilePath = logFilePath;
    }
    async append(entry) {
        const logEntry = {
            ts: new Date().toISOString(),
            ...entry,
        };
        const logs = await this.getAll();
        logs.push(logEntry);
        await (0, promises_1.mkdir)(node_path_1.default.dirname(this.logFilePath), { recursive: true });
        await (0, promises_1.writeFile)(this.logFilePath, `${JSON.stringify(logs, null, 2)}\n`, "utf8");
        return logEntry;
    }
    async getAll() {
        try {
            const raw = await (0, promises_1.readFile)(this.logFilePath, "utf8");
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            if (this.isNotFoundError(error)) {
                return [];
            }
            throw error;
        }
    }
    isNotFoundError(error) {
        return (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "ENOENT");
    }
}
exports.LoggerService = LoggerService;
exports.loggerService = new LoggerService();
