import type { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as userService from "./auth.service.js";
import { StatusCodes } from "http-status-codes";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/apiError.js";

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
    const user = await userService.login(req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "You are logged in Successfully",
      data: user,
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
