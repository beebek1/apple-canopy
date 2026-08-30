import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import {
  upload,
  handleUploadError,
} from "../../middlewares/upload.middleware.js";
import { uploadImage } from "./media.controller.js";

const router = Router();

router.post(
  "/upload",
  verifyAccessToken,
  upload.single("image"),
  handleUploadError,
  uploadImage,
);

export default router;
