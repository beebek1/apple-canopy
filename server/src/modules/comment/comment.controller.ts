import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as commentService from "./comment.service.js";
import type { VisitorRequest } from "../../middlewares/visitors/visitor.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/apiError.js";

type Req = VisitorRequest & AuthRequest;

function getClientIp(req: Req): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export const createComment = asyncHandler(async (req: Req, res: Response) => {
  const ip = getClientIp(req);
  const { authorName } = req.body;
  
  const comment = await commentService.createComment(
    req.body,
    req.visitorId!,
    authorName,
    ip,
  );

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Comment posted",
    data: comment,
  });
});

export const listComments = asyncHandler(async (req: Req, res: Response) => {
    const { postId } = req.params;
    if (typeof postId !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid id");
    }
    const comments = await commentService.listCommentsForPost(postId!);
    return res.status(StatusCodes.OK).json({
        success: true,
        message: "Comments fetched",
        data: comments,
    });
});
