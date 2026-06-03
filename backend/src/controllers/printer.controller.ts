import type { Request, Response } from "express";
import { logExportService } from "../logs/log-export.service";
import { loggerService, type LogEntry } from "../logs/logger.service";
import { printerService } from "../services/printer.service";
import {
  createApiFailure,
  createApiSuccess,
  type ApiError,
  type ApiResponse,
} from "../types/api.types";
import type {
  ConnectionInfo,
  PrintablePayload,
  PrintJob,
  PrinterHealth,
  PrinterStatus,
} from "../types/printer.types";
import {
  isConnectRequestBody,
  isImagePrintPayload,
  isQrPrintPayload,
  isReceiptPrintPayload,
  isReprintRequestBody,
  isSetMockHealthRequestBody,
  isTextPrintPayload,
} from "../utils/validators";

type EmptyParams = Record<string, never>;

export class PrinterController {
  connect = async (
    req: Request<EmptyParams, ApiResponse<ConnectionInfo>, unknown>,
    res: Response<ApiResponse<ConnectionInfo>>,
  ): Promise<void> => {
    if (!isConnectRequestBody(req.body)) {
      this.sendValidationError(res, "Body must include mode as 'usb' or 'lan'.");
      return;
    }

    const connection = await printerService.connect(req.body.mode);
    res.json(createApiSuccess(connection));
  };

  status = (
    _req: Request<EmptyParams, ApiResponse<PrinterStatus>>,
    res: Response<ApiResponse<PrinterStatus>>,
  ): void => {
    res.json(createApiSuccess(printerService.getStatus()));
  };

  printText = async (
    req: Request<EmptyParams, ApiResponse<PrintJob<PrintablePayload>>, unknown>,
    res: Response<ApiResponse<PrintJob<PrintablePayload>>>,
  ): Promise<void> => {
    if (!isTextPrintPayload(req.body)) {
      this.sendValidationError(res, "Body must include a non-empty text field.");
      return;
    }

    const job = await printerService.printText(req.body);
    res.json(createApiSuccess(job));
  };

  printImage = async (
    req: Request<EmptyParams, ApiResponse<PrintJob<PrintablePayload>>, unknown>,
    res: Response<ApiResponse<PrintJob<PrintablePayload>>>,
  ): Promise<void> => {
    if (!isImagePrintPayload(req.body)) {
      this.sendValidationError(
        res,
        "Body must include imageBase64 or imageUrl. Optional filename must be a non-empty string.",
      );
      return;
    }

    const job = await printerService.printImage(req.body);
    res.json(createApiSuccess(job));
  };

  printQr = async (
    req: Request<EmptyParams, ApiResponse<PrintJob<PrintablePayload>>, unknown>,
    res: Response<ApiResponse<PrintJob<PrintablePayload>>>,
  ): Promise<void> => {
    if (!isQrPrintPayload(req.body)) {
      this.sendValidationError(res, "Body must include a non-empty data field.");
      return;
    }

    const job = await printerService.printQr(req.body);
    res.json(createApiSuccess(job));
  };

  printReceipt = async (
    req: Request<EmptyParams, ApiResponse<PrintJob<PrintablePayload>>, unknown>,
    res: Response<ApiResponse<PrintJob<PrintablePayload>>>,
  ): Promise<void> => {
    if (!isReceiptPrintPayload(req.body)) {
      this.sendValidationError(
        res,
        "Body must include machineId, rewardName and a valid items array.",
      );
      return;
    }

    const job = await printerService.printReceipt(req.body);
    res.json(createApiSuccess(job));
  };

  reprint = async (
    req: Request<EmptyParams, ApiResponse<PrintJob<PrintablePayload>>, unknown>,
    res: Response<ApiResponse<PrintJob<PrintablePayload>>>,
  ): Promise<void> => {
    if (!isReprintRequestBody(req.body)) {
      this.sendValidationError(res, "Body must include a non-empty jobId field.");
      return;
    }

    try {
      const job = await printerService.reprint(req.body.jobId);
      res.json(createApiSuccess(job));
    } catch (error) {
      this.sendError(res, this.errorToApiError(error));
    }
  };

  logs = async (
    _req: Request<EmptyParams, ApiResponse<LogEntry[]>>,
    res: Response<ApiResponse<LogEntry[]>>,
  ): Promise<void> => {
    const logs = await loggerService.getAll();
    res.json(createApiSuccess(logs));
  };

  logsExport = async (
    _req: Request<EmptyParams, string>,
    res: Response<string>,
  ): Promise<void> => {
    const logs = await loggerService.getAll();
    const csv = logExportService.toCsv(logs);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="logs.csv"');
    res.send(csv);
  };

  setMockHealth = (
    req: Request<EmptyParams, ApiResponse<PrinterHealth>, unknown>,
    res: Response<ApiResponse<PrinterHealth>>,
  ): void => {
    if (!isSetMockHealthRequestBody(req.body)) {
      this.sendValidationError(
        res,
        "Body must include at least one valid health field: paper, cover or temperature.",
      );
      return;
    }

    const health = printerService.setHealth(req.body);
    res.json(createApiSuccess(health));
  };

  simulateDisconnect = async (
    _req: Request<EmptyParams, ApiResponse<ConnectionInfo>>,
    res: Response<ApiResponse<ConnectionInfo>>,
  ): Promise<void> => {
    const connection = await printerService.simulateDisconnect();
    res.json(createApiSuccess(connection));
  };

  private sendValidationError<T>(res: Response<ApiResponse<T>>, message: string): void {
    res.status(400).json(
      createApiFailure({
        code: "VALIDATION_ERROR",
        message,
      }),
    );
  }

  private sendError<T>(res: Response<ApiResponse<T>>, error: ApiError): void {
    const statusCode = this.getHttpStatusCode(error);
    res.status(statusCode).json(createApiFailure(error));
  }

  private getHttpStatusCode(error: ApiError): number {
    if (error.code === "BAD_REQUEST" || error.code === "VALIDATION_ERROR") {
      return 400;
    }

    if (error.code === "NOT_FOUND") {
      return 404;
    }

    return 500;
  }

  private errorToApiError(error: unknown): ApiError {
    if (error instanceof Error && error.message.startsWith("Print job not found")) {
      return {
        code: "NOT_FOUND",
        message: "Print job not found.",
        detail: error.message,
      };
    }

    if (error instanceof Error && error.message.startsWith("Print job is not failed")) {
      return {
        code: "BAD_REQUEST",
        message: "Only failed jobs can be reprinted.",
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

export const printerController = new PrinterController();
