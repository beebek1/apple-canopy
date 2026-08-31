// import { Resend } from "resend";
// import { ApiError } from "../apiError.js";

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }

// const resend = new Resend(process.env.RESEND_API_KEY);

// const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// console.log(
//   process.env.RESEND_API_KEY
//     ? "RESEND API KEY EXISTS"
//     : "RESEND API KEY MISSING",
// );

// const sendEmail = async ({ to, subject, html }: EmailOptions) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: `Apple Canopy <${FROM_EMAIL}>`,
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       console.error("EMAIL ERROR:", error);
//       throw new ApiError(500, error.message || "Failed to send email");
//     }

//     return data;
//   } catch (error: any) {
//     console.error("EMAIL ERROR:", error);
//     throw new ApiError(500, error.message || "Failed to send email");
//   }
// };

// export const emailSender = async (
//   email: string,
//   subject: string,
//   html: string,
// ) => {
//   if (!email || !subject || !html) {
//     throw new ApiError(400, "Email, subject and html content are required");
//   }

//   await sendEmail({ to: email, subject, html });
// };

// export default emailSender;


import nodemailer from "nodemailer";
import { ApiError } from "../apiError.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

console.log(
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? "GMAIL CREDENTIALS EXIST"
    : "GMAIL CREDENTIALS MISSING",
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // force IPv4 — avoids ENETUNREACH on hosts without IPv6 egress
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

transporter.verify((error: unknown) => {
  if (error) {
    console.error("SMTP VERIFY FAILED:", error);
  } else {
    console.log("SMTP VERIFY SUCCESS: server is ready to send");
  }
});

const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Apple Canopy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent, messageId:", info.messageId);
    return info;
  } catch (error: unknown) {
    console.error("EMAIL ERROR:", error);
    throw new ApiError(500, "Failed to send email");
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