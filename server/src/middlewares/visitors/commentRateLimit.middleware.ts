import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/apiError.js";
import type { VisitorRequest } from "./visitor.middleware.js";
import { COMMENT_RATE_LIMIT } from "../../utils/rateLimit.utils.js";

// key ("v:<visitorId>" or "ip:<ip>") -> recent request timestamps (ms)
const hitLog = new Map<string, number[]>();

// Periodic sweep so this map doesn't grow forever from one-off visitors.
// unref() so it doesn't keep the process alive on its own.
setInterval(() => {
  const cutoff = Date.now() - COMMENT_RATE_LIMIT.WINDOW_MS;
  for (const [key, timestamps] of hitLog.entries()) {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) hitLog.delete(key);
    else hitLog.set(key, recent);
  }
}, 5 * 60_000).unref();

function getClientIp(req: VisitorRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export function commentRateLimit(
  req: VisitorRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.visitorId) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Missing visitor identity",
    );
  }

  const now = Date.now();
  const windowStart = now - COMMENT_RATE_LIMIT.WINDOW_MS;
  // visitorId is primary; IP is a secondary signal so clearing cookies from
  // the same IP doesn't grant a fresh allowance.
  const keys = [`v:${req.visitorId}`, `ip:${getClientIp(req)}`];

  for (const key of keys) {
    const recent = (hitLog.get(key) ?? []).filter((t) => t > windowStart);
    if (recent.length >= COMMENT_RATE_LIMIT.MAX_REQUESTS) {
      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        "You're commenting too quickly. Please wait a moment and try again.",
      );
    }
  }

  for (const key of keys) {
    const recent = (hitLog.get(key) ?? []).filter((t) => t > windowStart);
    recent.push(now);
    hitLog.set(key, recent);
  }

  next();
}
