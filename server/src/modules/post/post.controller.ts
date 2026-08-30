import type { Request ,Response } from "express";
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

export const listPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
    }

    const status = (req.query.status as string) ?? "all";
    const category = req.query.category as string | undefined;
    const search = (req.query.search as string) ?? "";
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await postService.listPosts(authorId, {
      status: status as "all" | "published" | "draft",
      category,
      search,
      page,
      limit,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Posts fetched",
      data: result,
    });
  },
);

export const updatePostStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.id;
    const { id } = req.params;
    if (!authorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
    }
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid id");
    }

    const result = await postService.updatePostStatus(
      authorId,
      id,
      req.body.status,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Status updated",
      data: result,
    });
  },
);

export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.id;
    const { id } = req.params;
    if (!authorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Not authenticated");
    }
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid id");
    }

    const result = await postService.deletePost(authorId, id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post deleted",
      data: result,
    });
  },
);

export const listPublicPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const search = ((req.query.search as string) ?? "").trim();
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 5, 50);

    const result = await postService.listPublicPosts({
      category: category && category !== "All Category" ? category : undefined,
      search: search || undefined,
      sort,
      page,
      limit,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Articles fetched",
      data: result,
    });
  },
);

export const getPublicPost = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("boi look")
    const { id } = req.params;
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid id");
    }
    const post = await postService.getPublicPostById(id);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Article fetched",
      data: post,
    });
  },
);