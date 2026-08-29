// src/features/media/media.controller.ts
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { buildImagePath } from "./media.service.js";

export const uploadImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No image file provided");
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Image uploaded",
      data: { path: buildImagePath(req.file.filename) },
    });
  },
);
