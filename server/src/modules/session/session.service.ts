import type { Request } from "express";
import db from "../../config/db.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

export const createSession = async (adminId: number, req: Request) => {
  return db.session.create({
    data: {
      adminId,
      userAgent: req.headers["user-agent"] ?? "unknown",
      ip: getClientIp(req),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
};

export const validateSession = async (sessionId: string, adminId: number) => {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) return null;
  if (session.adminId !== adminId) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt < new Date()) return null;
  return session;
};

export const listActiveSessions = async (adminId: number) => {
  return db.session.findMany({
    where: { adminId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
};

export const revokeSession = async (sessionId: string, adminId: number) => {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session || session.adminId !== adminId) return false;
  await db.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
  return true;
};

export const revokeAllExcept = async (
  adminId: number,
  currentSessionId: string,
) => {
  await db.session.updateMany({
    where: { adminId, id: { not: currentSessionId }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
