import { StatusCodes } from "http-status-codes";
import db from "../../config/db.js";
import { ApiError } from "../../utils/apiError.js";
import type { PostSaveInput } from "./post.validator.js";

export const savePost = async (authorId: number, data: PostSaveInput) => {
  let content;
  try {
    content = JSON.parse(data.content);
  } catch {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid content payload");
  }

  const payload = {
    title: data.title,
    dek: data.dek,
    category: data.category,
    status:
      data.status === "published" ? ("PUBLISHED" as const) : ("DRAFT" as const),
    heroImage: data.heroImage ?? null,
    content,
    ...(data.status === "published" ? { publishedAt: new Date() } : {}),
  };

  if (data.id) {
    const existing = await db.post.findUnique({ where: { id: data.id } });
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
    }
    if (existing.authorId !== authorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You don't own this post");
    }
    return db.post.update({
      where: { id: data.id },
      data: payload,
      select: { id: true },
    });
  }

  return db.post.create({
    data: { ...payload, authorId },
    select: { id: true },
  });

};

export const getPostById = async (authorId: number, id: string) => {
  const post = await db.post.findUnique({ where: { id } });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }
  if (post.authorId !== authorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You don't own this post");
  }

  return post;
};
