import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import {
  listSessions,
  revokeSession,
  revokeOtherSessions,
  logout,
} from "./session.controller.js";

const router = Router();

router.get("/", verifyAccessToken, listSessions);
router.delete("/:sessionId", verifyAccessToken, revokeSession);
router.delete("/", verifyAccessToken, revokeOtherSessions);
router.post("/logout", verifyAccessToken, logout);

export default router;
