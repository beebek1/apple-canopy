import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import {
  upload,
  handleUploadError,
} from "../../middlewares/upload.middleware.js";
import { postSaveSchema, postStatusUpdateSchema } from "./post.validator.js";
import {
  savePost,
  getPost,
  listPosts,
  updatePostStatus,
  deletePost,
  listPublicPosts,
  getPublicPost,
} from "./post.controller.js";

const router = Router();

router.get("/public", listPublicPosts);

router.get("/", verifyAccessToken, listPosts);

router.post(
  "/autosave",
  verifyAccessToken,
  upload.none(),
  handleUploadError,
  validator(postSaveSchema),
  savePost,
);

router.patch(
  "/:id/status",
  verifyAccessToken,
  validator(postStatusUpdateSchema),
  updatePostStatus,
);

router.delete("/:id", verifyAccessToken, deletePost);

router.get("/:id", verifyAccessToken, getPost);

router.get("/public/:id", getPublicPost);

export default router;
