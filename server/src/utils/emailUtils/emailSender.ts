import { Resend } from "resend";
import { ApiError } from "../apiError.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

console.log(
  process.env.RESEND_API_KEY
    ? "RESEND API KEY EXISTS"
    : "RESEND API KEY MISSING",
);

const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Apple Canopy <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("EMAIL ERROR:", error);
      throw new ApiError(500, error.message || "Failed to send email");
    }

    return data;
  } catch (error: any) {
    console.error("EMAIL ERROR:", error);
    throw new ApiError(500, error.message || "Failed to send email");
  }
};

export const emailSender = async (
  email: string,
  subject: string,
  html: string,
) => {
  if (!email || !subject || !html) {
    throw new ApiError(400, "Email, subject and html content are required");
  }

  await sendEmail({ to: email, subject, html });
};

export default emailSender;
