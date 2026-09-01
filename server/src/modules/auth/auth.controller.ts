import type { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as userService from "./auth.service.js";
import { StatusCodes } from "http-status-codes";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/apiError.js";

const isProduction = process.env.NODE_ENV === "production";

export const registerUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const verificationToken = req.query.token;

    if (typeof verificationToken !== "string") {
      throw new ApiError(400, "Invalid token");
    }
    const user = await userService.register(verificationToken);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Kindly check your email for your credentials",
      data: user,
    });
  },
);

export const loginUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const token = await userService.login(req.body, req);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "You are logged in Successfully",
    });
  },
);

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.verifyEmail();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Kindly verify yourself via the email",
      data: user,
    });
  },
);

export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Authenticated",
    });
  },
);
