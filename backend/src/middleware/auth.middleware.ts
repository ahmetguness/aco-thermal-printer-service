import type { Request, Response, NextFunction } from "express";
import { createApiFailure } from "../types/api.types";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = process.env.API_ACCESS_TOKEN || "test-token-1234";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json(
      createApiFailure({
        code: "UNAUTHORIZED",
        message: "Access token is missing or invalid. Use 'Bearer <token>'.",
      })
    );
    return;
  }

  const providedToken = authHeader.substring(7).trim();

  if (providedToken !== token) {
    res.status(401).json(
      createApiFailure({
        code: "UNAUTHORIZED",
        message: "Unauthorized. Access token is incorrect.",
      })
    );
    return;
  }

  next();
}
