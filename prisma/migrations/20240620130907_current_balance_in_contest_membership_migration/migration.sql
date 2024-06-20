/*
  Warnings:

  - You are about to drop the column `currentMoneyAmount` on the `ContestMembership` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContestMembership" DROP COLUMN "currentMoneyAmount",
ADD COLUMN     "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
