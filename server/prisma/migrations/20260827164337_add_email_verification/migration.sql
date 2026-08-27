/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "verificationToken" VARCHAR(255),
ADD COLUMN     "verificationTokenExpires" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");
