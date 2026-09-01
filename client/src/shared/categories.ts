export const CATEGORIES = [
  "Plantation",
  "Forests",
  "Wildlife",
  "Climate",
  "Community",
] as const;

export type Category = (typeof CATEGORIES)[number];
