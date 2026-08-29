import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

type AccessTokenPayload = {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
};

export const verifyAccessToken = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
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
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Invalid or expired token",
      );
    }

    if (!decoded?.id || !decoded?.username) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: Invalid token payload",
      );
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  },
);
