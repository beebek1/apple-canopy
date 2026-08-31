import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import {
  upload,
  handleUploadError,
} from "../../middlewares/upload.middleware.js";
import { statusUpsertSchema } from "./status.validator.js";
import { upsertStatus, listPublicStatuses } from "./status.controller.js";

const router = Router();

router.get("/public", listPublicStatuses);

router.put(
  "/:slot",
  verifyAccessToken,
  upload.single("image"),
  handleUploadError,
  validator(statusUpsertSchema),
  upsertStatus,
);

export default router;
