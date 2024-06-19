/*
  Warnings:

  - Added the required column `userId` to the `Leaderboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leaderboard" ADD COLUMN     "userId" TEXT NOT NULL;
