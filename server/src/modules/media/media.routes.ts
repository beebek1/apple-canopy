// src/features/media/media.routes.ts
import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { uploadImage } from "./media.controller.js";

const router = Router();

router.post("/upload", verifyAccessToken, upload.single("image"), uploadImage);

export default router;
