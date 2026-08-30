import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware.js";
import { ensureVisitorId } from "../../middlewares/visitors/visitor.middleware.js";
import { optionalAuth } from "../../middlewares/visitors/optionalAuth.middleware.js";
import { commentRateLimit } from "../../middlewares/visitors/commentRateLimit.middleware.js";
import { createCommentSchema } from "./comment.validator.js";
import { createComment, listComments } from "./comment.controller.js";

const router = Router();

router.get("/post/:postId", listComments);

router.post(
  "/",
  optionalAuth,
  ensureVisitorId,
  commentRateLimit,
  validator(createCommentSchema),
  createComment,
);

export default router;
