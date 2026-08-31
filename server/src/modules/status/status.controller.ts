import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { uploadBufferToCloudinary } from "../media/media.service.js"; // adjust path
import * as statusService from "./status.service.js";

export const upsertStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authorId = req.user?.id;
  if (!authorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
  }

  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "An image is required for each status");
  }

  const slot = Number(req.params.slot);
  const { secureUrl } = await uploadBufferToCloudinary(req.file.buffer, "status");

  const status = await statusService.upsertStatus(slot, {
    category: req.body.category,
    heading: req.body.heading,
    body: req.body.body,
    bodyType: req.body.bodyType ?? "paragraph",
    image: secureUrl,
    authorId,
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Status updated",
    data: status,
  });
});

export const listPublicStatuses = asyncHandler(async (req: Request, res: Response) => {
  const statuses = await statusService.listPublicStatuses();
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Statuses fetched",
    data: statuses,
  });
});