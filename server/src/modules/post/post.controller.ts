import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as postService from "./post.service.js";

export const savePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
    }

    const result = await postService.savePost(authorId, req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post saved",
      data: result,
    });
  },
);


export const getPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log("im here boii")
  const authorId = req.user?.id;
  const token = req.params.id;
  if (!authorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
  }

  if (typeof token !== "string") {
    throw new ApiError(400, "Invalid token");
  }

  const post = await postService.getPostById(authorId, token);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Post fetched",
    data: post,
  });
});