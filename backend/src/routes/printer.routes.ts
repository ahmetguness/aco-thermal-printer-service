import { Router } from "express";
import { printerController } from "../controllers/printer.controller";

export const printerRouter = Router();

printerRouter.post("/connect", printerController.connect);
printerRouter.get("/status", printerController.status);
printerRouter.post("/print/text", printerController.printText);
printerRouter.post("/print/image", printerController.printImage);
printerRouter.post("/print/qr", printerController.printQr);
printerRouter.post("/print/receipt", printerController.printReceipt);
printerRouter.post("/reprint", printerController.reprint);
printerRouter.get("/logs", printerController.logs);
printerRouter.get("/logs/export", printerController.logsExport);
printerRouter.post("/mock/health", printerController.setMockHealth);
printerRouter.post("/mock/disconnect", printerController.simulateDisconnect);
