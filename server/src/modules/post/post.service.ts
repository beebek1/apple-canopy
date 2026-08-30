import { StatusCodes } from "http-status-codes";
import db from "../../config/db.js";
import { ApiError } from "../../utils/apiError.js";
import type { PostSaveInput } from "./post.validator.js";


export interface PostListFilters {
  status?: "all" | "published" | "draft";
  category?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PublicPostListFilters {
  category?: string;
  search?: string;
  sort: "newest" | "oldest";
  page: number;
  limit: number;
}

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

export const listPosts = async (authorId: number, filters: PostListFilters) => {
  const { status, category, search, page, limit } = filters;

  const where: any = { authorId };

  if (status && status !== "all") {
    where.status = status === "published" ? "PUBLISHED" : "DRAFT";
  }
  if (category && category !== "All Category") {
    where.category = category;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [posts, total, publishedCount, draftCount] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        dek: true,
        category: true,
        heroImage: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        author: { select: { username: true } },
      },
    }),
    db.post.count({ where }),
    db.post.count({ where: { authorId, status: "PUBLISHED" } }),
    db.post.count({ where: { authorId, status: "DRAFT" } }),
  ]);

  return {
    posts,
    pagination: { page, limit, total },
    stats: {
      all: publishedCount + draftCount,
      published: publishedCount,
      draft: draftCount,
      totalViews: 0, // replace with a db.post.aggregate({_sum:{views:true}}) once tracked
    },
  };
};

export const updatePostStatus = async (
  authorId: number,
  id: string,
  status: "published" | "draft",
) => {
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  if (existing.authorId !== authorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You don't own this post");
  }

  const mapped =
    status === "published" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  return db.post.update({
    where: { id },
    data: {
      status: mapped,
      ...(mapped === "PUBLISHED" && !existing.publishedAt
        ? { publishedAt: new Date() }
        : {}),
    },
    select: { id: true, status: true },
  });
};

export const deletePost = async (authorId: number, id: string) => {
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  if (existing.authorId !== authorId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You don't own this post");
  }

  await db.post.delete({ where: { id } });
  return { id };
};

export const listPublicPosts = async (filters: PublicPostListFilters) => {
  const { category, search, sort, page, limit } = filters;

  const where: any = { status: "PUBLISHED" };
  if (category && category !== "All Category") {
    where.category = category;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: sort === "newest" ? "desc" : "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        dek: true,
        category: true,
        heroImage: true,
        publishedAt: true,
        author: { select: { username: true } },
        _count: { select: { comments: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  };
};

export const getPublicPostById = async (id: string) => {
  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      dek: true,
      category: true,
      heroImage: true,
      content: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  return post;
};

