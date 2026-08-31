-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL DEFAULT 'paragraph',
    "image" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_slot_key" ON "Status"("slot");

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admin"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
