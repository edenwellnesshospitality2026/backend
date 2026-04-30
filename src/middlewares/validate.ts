import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }
    req.body = parsed.data;
    return next();
  };
