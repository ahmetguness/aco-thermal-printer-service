import cors from "cors";
import express, { type Request, type Response } from "express";
import { printerRouter } from "./routes/printer.routes";
import { createApiSuccess, type ApiResponse } from "./types/api.types";

export interface HealthResponse {
  status: "ok";
  service: "thermal-printer-service";
}

export const app = express();

app.use(cors());
app.use(express.json());
app.use(printerRouter);

app.get("/health", (_req: Request, res: Response<ApiResponse<HealthResponse>>) => {
  res.json(
    createApiSuccess({
      status: "ok",
      service: "thermal-printer-service",
    }),
  );
});
