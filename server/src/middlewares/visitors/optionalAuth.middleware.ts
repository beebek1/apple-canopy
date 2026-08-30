import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../auth.middleware.js";

type AccessTokenPayload = {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
};

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;
  if (!token) return next();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AccessTokenPayload;
    if (decoded?.id && decoded?.username) {
      req.user = { id: decoded.id, username: decoded.username };
    }
  } catch {
    // expired/invalid token — treat as anonymous rather than blocking
  }
  next();
}
