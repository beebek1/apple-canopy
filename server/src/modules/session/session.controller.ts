import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as sessionService from "./session.service.js";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
};

export const listSessions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const sessions = await sessionService.listActiveSessions(req.user!.id);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        ip: s.ip,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.id === req.user!.sessionId,
      })),
    });
  },
);

export const revokeSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    
    const { sessionId } = req.params;
    if(typeof sessionId !== "string"){
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid SessionID")
    }
    const ok = await sessionService.revokeSession(sessionId, req.user!.id);

    if (!ok) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Session revoked",
    });
  },
);

export const revokeOtherSessions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await sessionService.revokeAllExcept(req.user!.id, req.user!.sessionId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Other sessions revoked",
    });
  },
);

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await sessionService.revokeSession(req.user!.sessionId, req.user!.id);
  res.clearCookie("accessToken", COOKIE_OPTIONS);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Logged out",
  });
});
