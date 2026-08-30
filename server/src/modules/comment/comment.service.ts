import { StatusCodes } from "http-status-codes";
import db from "../../config/db.js";
import { ApiError } from "../../utils/apiError.js";
import type { CreateCommentInput } from "./comment.validator.js";

export const createComment = async (
  data: CreateCommentInput,
  visitorId: string,
  authorName: string,
  ip: string,
) => {
  const post = await db.post.findUnique({
    where: { id: data.postId },
    select: { id: true, status: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  return db.comment.create({
    data: {
      content: data.content,
      postId: data.postId,
      visitorId,
      authorName,
      ip,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorName: true,
    },
  });
};

export const listCommentsForPost = async (postId: string) => {
  return db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorName: true,
    },
  });
};
