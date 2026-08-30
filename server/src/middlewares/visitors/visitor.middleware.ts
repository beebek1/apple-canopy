import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export interface VisitorRequest extends Request {
  visitorId?: string;
  authorName?: string;
}

const VISITOR_COOKIE_NAME = "visitorId";
const VISITOR_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

export function ensureVisitorId(
  req: VisitorRequest,
  res: Response,
  next: NextFunction,
) {
  let visitorId = req.cookies?.[VISITOR_COOKIE_NAME];

  if (!visitorId || typeof visitorId !== "string") {
    visitorId = randomUUID();
    res.cookie(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VISITOR_COOKIE_MAX_AGE_MS,
      path: "/",
    });
  }

  req.visitorId = visitorId;
  next();
}
