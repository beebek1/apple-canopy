import Stripe from "stripe";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import * as paymentService from "./payment.service.js";
import type { CreateCheckoutSessionInput } from "./payment.validator.js";

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateCheckoutSessionInput;
    const url = await paymentService.createCheckoutSession(data);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Checkout session created",
      data: { url },
    });
  },
);

export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("🔥 WEBHOOK RECEIVED");
    const signature = req.headers["stripe-signature"];

    if (typeof signature !== "string") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing stripe-signature header",
      );
    }

    let event;
    try {
      event = paymentService.constructWebhookEvent(
        req.body as Buffer,
        signature,
      );
    } catch (err) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Webhook Error: ${(err as Error).message}`,
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        await paymentService.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(StatusCodes.OK).json({ received: true });
  },
);

export const getDonations = asyncHandler(async (_req: Request, res: Response) => {
  const donations = await paymentService.listCompletedDonations();
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Donations fetched",
    data: donations,
  });
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (typeof sessionId !== "string") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid session id");
  }

  const donation = await paymentService.getDonationBySessionId(sessionId);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Donation fetched",
    data: donation,
  });
});