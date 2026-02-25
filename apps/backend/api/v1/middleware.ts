import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not present, Check .env file.")
}

/**
 * Extracts token from Authorization header (Bearer <token>) or from cookie.
 */
function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim() || null;
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    const match = cookieHeader.match(/\btoken=([^;]*)/);
    const value = match?.[1];
    if (value) return value.trim() || null;
  }
  return null;
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({ message: "Missing or invalid token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    const payload = typeof decoded === "object" && decoded !== null && "sub" in decoded ? decoded : null;
    if (!payload?.sub) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
