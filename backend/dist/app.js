"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const printer_routes_1 = require("./routes/printer.routes");
const api_types_1 = require("./types/api.types");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(printer_routes_1.printerRouter);
exports.app.get("/health", (_req, res) => {
    res.json((0, api_types_1.createApiSuccess)({
        status: "ok",
        service: "thermal-printer-service",
    }));
});
