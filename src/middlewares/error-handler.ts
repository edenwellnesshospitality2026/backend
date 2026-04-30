import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err }, "Unhandled server error");
  return res.status(500).json({ error: "Internal server error" });
};
