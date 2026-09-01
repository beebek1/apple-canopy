import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/apiError.js";
import  db  from "../../config/db.js";
import type { CreateCheckoutSessionInput } from "./payment.validator.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia",
});

export const createCheckoutSession = async (
  data: CreateCheckoutSessionInput,
) => {
  const donation = await db.donation.create({
    data: {
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      amount: data.amount,
      currency: data.currency,
      note: data.note,
      status: "PENDING",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: data.currency,
          product_data: { name: "Donation" },
          unit_amount: data.amount,
        },
        quantity: 1,
      },
    ],
    customer_email: data.donorEmail,
    metadata: { donationId: donation.id },
    success_url: `${process.env.FRONTEND_LINK}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_LINK}/donate/cancel`,
  });

  if (!session.url) {
    await db.donation.update({
      where: { id: donation.id },
      data: { status: "FAILED" },
    });
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create checkout session",
    );
  }

  await db.donation.update({
    where: { id: donation.id },
    data: { stripeSessionId: session.id },
  });

  return session.url;
};

export const constructWebhookEvent = (payload: Buffer, signature: string) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );
};

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  console.log("CHECKOUT COMPLETED:", session.id);
  console.log("METADATA:", session.metadata);
  console.log("PAYMENT INTENT:", session.payment_intent);

  const donationId = session.metadata?.donationId;

  if (!donationId) {
    console.error(
      "checkout.session.completed with no donationId metadata:",
      session.id,
    );
    return;
  }

  const donation = await db.donation.update({
    where: { id: donationId },
    data: {
      status: "COMPLETED",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      paidAt: new Date(),
    },
  });

  console.log("DONATION UPDATED:", donation);
};

export const getDonationBySessionId = async (sessionId: string) => {
  const donation = await db.donation.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!donation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Donation not found");
  }

  return donation;
};

export const listCompletedDonations = async () => {
  return db.donation.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
};

export const getCheckoutSession = async (sessionId: string) => {
  return stripe.checkout.sessions.retrieve(sessionId);
};
