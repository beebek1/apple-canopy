import db from "../../config/db.js"; // adjust to your actual db client

interface UpsertStatusInput {
  category: string;
  heading: string;
  body: string;
  bodyType: "paragraph" | "quote";
  image: string;
  authorId: number;
}

export async function upsertStatus(slot: number, data: UpsertStatusInput) {
  return db.status.upsert({
    where: { slot },
        update: { ...data },
        create: { slot, ...data },
  });
}

export async function listPublicStatuses() {
  return db.status.findMany({
    orderBy: { slot: "asc" },
    select: {
      id: true,
      slot: true,
      category: true,
      heading: true,
      body: true,
      bodyType: true,
      image: true,
    },
  });
}
