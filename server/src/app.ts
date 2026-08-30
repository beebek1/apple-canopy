import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./config/cloudinary.config.js";
import rootRouter from "./modules/main.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_LINK,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AppleCanopy API" });
});

app.use("/api", rootRouter);

// Error Handler
app.use(errorHandler);

export default app;
