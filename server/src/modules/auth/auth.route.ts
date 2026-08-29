import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import { authLoginSchema } from "./auth.validator.js";

import { loginUser, registerUser, verifyEmail, getCurrentUser } from "./auth.controller.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", validator(authLoginSchema), loginUser);
router.post("/verify", verifyEmail)
router.get("/me", verifyAccessToken, getCurrentUser);

export default router;
