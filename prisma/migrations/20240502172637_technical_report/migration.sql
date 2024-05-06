/*
  Warnings:

  - You are about to drop the column `userId` on the `report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_userId_fkey";

-- AlterTable
ALTER TABLE "report" DROP COLUMN "userId";
