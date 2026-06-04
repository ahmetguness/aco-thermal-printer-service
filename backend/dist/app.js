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
exports.app.use((0, cors_1.default)({
    origin: resolveCorsOrigin,
}));
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.get("/health", (_req, res) => {
    res.json((0, api_types_1.createApiSuccess)({
        status: "ok",
        service: "thermal-printer-service",
    }));
});
exports.app.use(printer_routes_1.printerRouter);
exports.app.use((_req, res) => {
    res.status(404).json((0, api_types_1.createApiFailure)({
        code: "NOT_FOUND",
        message: "Endpoint not found.",
    }));
});
exports.app.use((error, _req, res, _next) => {
    const detail = error instanceof Error ? error.message : undefined;
    res.status(500).json((0, api_types_1.createApiFailure)({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
        detail,
    }));
});
function resolveCorsOrigin(origin, callback) {
    if (!origin) {
        callback(null, true);
        return;
    }
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
    }
    if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
    }
    callback(new Error("CORS origin is not allowed."));
}
function getAllowedOrigins() {
    return (process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
}
