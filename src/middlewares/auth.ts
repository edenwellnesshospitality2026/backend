import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/service.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
