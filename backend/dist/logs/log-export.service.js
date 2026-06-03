"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExportService = exports.LogExportService = void 0;
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
];
class LogExportService {
    toCsv(logs) {
        const rows = logs.map((log) => this.toRow(log));
        return [CSV_HEADERS.join(","), ...rows].join("\n");
    }
    toRow(log) {
        const values = {
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
    escapeCsv(value) {
        const escaped = value.replaceAll('"', '""');
        return `"${escaped}"`;
    }
}
exports.LogExportService = LogExportService;
exports.logExportService = new LogExportService();
