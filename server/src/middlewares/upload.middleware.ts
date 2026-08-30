import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js"; // adjust path
import { StatusCodes } from "http-status-codes";

const storage = multer.memoryStorage();

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }
    cb(null, true);
  },
});

export function handleUploadError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, "Image must be under 8MB"),
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, "Unsupported image type"),
      );
    }
    return next(new ApiError(StatusCodes.BAD_REQUEST, err.message));
  }
  return next(err);
}
