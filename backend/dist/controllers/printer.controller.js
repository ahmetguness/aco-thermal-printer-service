"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printerController = exports.PrinterController = void 0;
const log_export_service_1 = require("../logs/log-export.service");
const logger_service_1 = require("../logs/logger.service");
const printer_service_1 = require("../services/printer.service");
const api_types_1 = require("../types/api.types");
const validators_1 = require("../utils/validators");
class PrinterController {
    connect = async (req, res) => {
        if (!(0, validators_1.isConnectRequestBody)(req.body)) {
            this.sendValidationError(res, "Body must include mode as 'usb' or 'lan'.");
            return;
        }
        const connection = await printer_service_1.printerService.connect(req.body.mode);
        res.json((0, api_types_1.createApiSuccess)(connection));
    };
    status = (_req, res) => {
        res.json((0, api_types_1.createApiSuccess)(printer_service_1.printerService.getStatus()));
    };
    printText = async (req, res) => {
        if (!(0, validators_1.isTextPrintPayload)(req.body)) {
            this.sendValidationError(res, "Body must include a non-empty text field.");
            return;
        }
        const job = await printer_service_1.printerService.printText(req.body);
        res.json((0, api_types_1.createApiSuccess)(job));
    };
    printImage = async (req, res) => {
        if (!(0, validators_1.isImagePrintPayload)(req.body)) {
            this.sendValidationError(res, "Body must include imageBase64 or imageUrl. Optional filename must be a non-empty string.");
            return;
        }
        const job = await printer_service_1.printerService.printImage(req.body);
        res.json((0, api_types_1.createApiSuccess)(job));
    };
    printQr = async (req, res) => {
        if (!(0, validators_1.isQrPrintPayload)(req.body)) {
            this.sendValidationError(res, "Body must include a non-empty data field.");
            return;
        }
        const job = await printer_service_1.printerService.printQr(req.body);
        res.json((0, api_types_1.createApiSuccess)(job));
    };
    printReceipt = async (req, res) => {
        if (!(0, validators_1.isReceiptPrintPayload)(req.body)) {
            this.sendValidationError(res, "Body must include machineId, rewardName and a valid items array.");
            return;
        }
        const job = await printer_service_1.printerService.printReceipt(req.body);
        res.json((0, api_types_1.createApiSuccess)(job));
    };
    reprint = async (req, res) => {
        if (!(0, validators_1.isReprintRequestBody)(req.body)) {
            this.sendValidationError(res, "Body must include a non-empty jobId field.");
            return;
        }
        try {
            const job = await printer_service_1.printerService.reprint(req.body.jobId);
            res.json((0, api_types_1.createApiSuccess)(job));
        }
        catch (error) {
            this.sendError(res, this.errorToApiError(error));
        }
    };
    logs = async (_req, res) => {
        const logs = await logger_service_1.loggerService.getAll();
        res.json((0, api_types_1.createApiSuccess)(logs));
    };
    logsExport = async (_req, res) => {
        const logs = await logger_service_1.loggerService.getAll();
        const csv = log_export_service_1.logExportService.toCsv(logs);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="logs.csv"');
        res.send(csv);
    };
    sendValidationError(res, message) {
        res.status(400).json((0, api_types_1.createApiFailure)({
            code: "VALIDATION_ERROR",
            message,
        }));
    }
    sendError(res, error) {
        const statusCode = error.code === "NOT_FOUND" ? 404 : 500;
        res.status(statusCode).json((0, api_types_1.createApiFailure)(error));
    }
    errorToApiError(error) {
        if (error instanceof Error && error.message.startsWith("Print job not found")) {
            return {
                code: "NOT_FOUND",
                message: "Print job not found.",
                detail: error.message,
            };
        }
        if (error instanceof Error) {
            return {
                code: "INTERNAL_ERROR",
                message: "Unexpected service error.",
                detail: error.message,
            };
        }
        return {
            code: "INTERNAL_ERROR",
            message: "Unexpected service error.",
        };
    }
}
exports.PrinterController = PrinterController;
exports.printerController = new PrinterController();
