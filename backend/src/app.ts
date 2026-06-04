import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { printerRouter } from "./routes/printer.routes";
import {
  createApiFailure,
  createApiSuccess,
  type ApiResponse,
} from "./types/api.types";

export interface HealthResponse {
  status: "ok";
  service: "thermal-printer-service";
}

export const app = express();

app.use(
  cors({
    origin: resolveCorsOrigin,
  }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req: Request, res: Response<ApiResponse<HealthResponse>>) => {
  res.json(
    createApiSuccess({
      status: "ok",
      service: "thermal-printer-service",
    }),
  );
});

app.use(printerRouter);

app.use((_req: Request, res: Response<ApiResponse<never>>) => {
  res.status(404).json(
    createApiFailure({
      code: "NOT_FOUND",
      message: "Endpoint not found.",
    }),
  );
});

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response<ApiResponse<never>>,
    _next: NextFunction,
  ) => {
    const detail = error instanceof Error ? error.message : undefined;

    res.status(500).json(
      createApiFailure({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
        detail,
      }),
    );
  },
);

function resolveCorsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void): void {
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

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
