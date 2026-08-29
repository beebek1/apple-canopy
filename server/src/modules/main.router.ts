import { Router } from "express";
import authRoute from "./auth/auth.route.js";
import  mediaRoute from "./media/media.routes.js";
import postRoute from "./post/post.routes.js"


const router = Router();

router.use("/auth", authRoute);
router.use("/posts", postRoute);
router.use("/media", mediaRoute);

export default router;
