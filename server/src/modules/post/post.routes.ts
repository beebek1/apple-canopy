import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { postSaveSchema } from "./post.validator.js";
import { savePost, getPost } from "./post.controller.js";

const router = Router();

router.post(
  "/autosave",
  verifyAccessToken,
  upload.none(),
  validator(postSaveSchema),
  savePost,
);

router.get("/:id", verifyAccessToken, getPost);
export default router;
