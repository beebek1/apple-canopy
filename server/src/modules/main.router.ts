import { Router } from "express";
import authRoute from "./auth/auth.route.js";
import  mediaRoute from "./media/media.routes.js";
import postRoute from "./post/post.routes.js"
import commentRoute from "./comment/comment.routes.js"


const router = Router();

router.use("/auth", authRoute);
router.use("/posts", postRoute);
router.use("/media", mediaRoute);
router.use("/comments", commentRoute);

export default router;
