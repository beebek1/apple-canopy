import { Router } from "express";
import express from "express";
import { validator } from "../../middlewares/validator.middleware.js";
import { createCheckoutSessionSchema } from "./payment.validator.js";
import { createCheckoutSession, getDonations, getSession, handleWebhook } from "./payment.controller.js";

const router = Router();

router.post(
  "/create-checkout-session",
  validator(createCheckoutSessionSchema),
  createCheckoutSession,
);

router.post("/webhook", handleWebhook);

router.get("/session/:sessionId", getSession);

router.get("/donations", getDonations);

export default router;
