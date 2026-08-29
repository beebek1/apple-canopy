import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import rootRouter from "./modules/main.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Uploads stuff
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AppleCanopy API" });
});

app.use("/api", rootRouter);

// Error Handler
app.use(errorHandler);

export default app;
