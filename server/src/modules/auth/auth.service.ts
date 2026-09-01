import bcrypt from "bcrypt";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request } from "express";

import db from "../../config/db.js";
import { ApiError } from "../../utils/apiError.js";
import type { LoginInput, RegisterInput } from "./auth.validator.js";
import emailSender from "../../utils/emailUtils/emailSender.js";
import generateCredentials from "../../utils/credentialsGenerator.js";
import registrationEmailTemplate from "../../utils/emailUtils/emailCredentials.js";
import verifyEmailTemplate from "../../utils/emailUtils/emailVerify.js";
import * as sessionService from "../session/session.service.js";

//============================================================REGISTER========================================================================

export const register = async (token: string) => {
  const users = await db.admin.findUnique({
    where: { email: process.env.ADMIN_EMAIL },
  });

  if (
    !users ||
    token !== users.verificationToken ||
    !users.verificationTokenExpires ||
    users.verificationTokenExpires < new Date()
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired token");
  }

  const credentials = await generateCredentials();
  const hashedPassword = await bcrypt.hash(credentials.password, 10);

  const user = await db.admin.findUnique({
    where: { email: process.env.ADMIN_EMAIL },
  });

  let result;

  if (user) {
    result = await db.admin.update({
      where: { email: process.env.ADMIN_EMAIL },
      data: {
        username: credentials.username,
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpires: null,
      },
      select: {
        username: true,
        email: true,
      },
    });
  } else {
    result = await db.admin.create({
      data: {
        username: credentials.username,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
      },
    });
  }

  await emailSender(
    process.env.ADMIN_EMAIL!,
    "Your Credential information",
    registrationEmailTemplate(credentials.username, credentials.password),
  );

  return result;
};

//============================================================LOGIN========================================================================

export const login = async (data: LoginInput, req: Request) => {
  const user = await db.admin.findUnique({
    where: { username: data.username },
  });

  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User with this username doesn't exists",
    );
  }

  const isPasswordCorrect = await bcrypt.compare(data.password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Email or password didn't match",
    );
  }

  const session = await sessionService.createSession(user.user_id, req);

  const payload = {
    id: user.user_id,
    username: user.username,
    sessionId: session.id,
  };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || ("7d" as any),
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, options);

  return token;
};

//============================================================VERIFY========================================================================

export const verifyEmail = async () => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

  const users = await db.admin.findUnique({
    where: { email: process.env.ADMIN_EMAIL },
  });

  await db.admin.update({
    where: { email: process.env.ADMIN_EMAIL },
    data: {
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpires,
    },
    select: {
      user_id: true,
      username: true,
      email: true,
    },
  });

  const verifyLink = `${process.env.VERIFY_LINK}?token=${verificationToken}`;
  await emailSender(
    process.env.ADMIN_EMAIL!,
    "verify your email",
    verifyEmailTemplate(users!.username, verifyLink),
  );
};
