import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as sessionService from "../modules/session/session.service.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    sessionId: string;
  };
}

type AccessTokenPayload = {
  id: number;
  username: string;
  sessionId: string;
  iat?: number;
  exp?: number;
};

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
};

export const verifyAccessToken = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Token missing",
      );
    }

    let decoded: AccessTokenPayload;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!,
      ) as AccessTokenPayload;
    } catch {
      res.clearCookie("accessToken", COOKIE_OPTIONS);

      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Invalid or expired token",
      );
    }

    if (!decoded?.id || !decoded?.username || !decoded?.sessionId) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Invalid token payload",
      );
    }

    const session = await sessionService.validateSession(
      decoded.sessionId,
      decoded.id,
    );

    if (!session) {
      res.clearCookie("accessToken", COOKIE_OPTIONS);

      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Session revoked or expired",
      );
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      sessionId: decoded.sessionId,
    };

    next();
  },
);
