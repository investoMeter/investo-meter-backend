/*
  Warnings:

  - You are about to drop the column `contestId` on the `contest_stocks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contest_stocks" DROP CONSTRAINT "contest_stocks_contestId_fkey";

-- AlterTable
ALTER TABLE "contest_stocks" DROP COLUMN "contestId";

-- CreateTable
CREATE TABLE "Contest_ContestStock" (
    "contestId" INTEGER NOT NULL,
    "contestStockId" INTEGER NOT NULL,

    CONSTRAINT "Contest_ContestStock_pkey" PRIMARY KEY ("contestId","contestStockId")
);

-- AddForeignKey
ALTER TABLE "Contest_ContestStock" ADD CONSTRAINT "Contest_ContestStock_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest_ContestStock" ADD CONSTRAINT "Contest_ContestStock_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
