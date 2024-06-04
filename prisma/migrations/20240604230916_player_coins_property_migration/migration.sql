/*
  Warnings:

  - You are about to drop the column `coinsCount` on the `players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "coinsCount",
ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0;
