import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import { authLoginSchema, authRegisterUserSchema } from "./auth.validator.js";

import { loginUser, registerUser, verifyEmail } from "./auth.controller.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", validator(authLoginSchema), loginUser);
router.post("/verify", verifyEmail)
export default router;
