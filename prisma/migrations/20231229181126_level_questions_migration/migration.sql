/*
  Warnings:

  - You are about to drop the column `starsCount` on the `LevelMembership` table. All the data in the column will be lost.
  - You are about to drop the column `levelId` on the `level_stocks` table. All the data in the column will be lost.
  - You are about to drop the column `firstStar` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `secondStar` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `startingBudget` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `thirdStar` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the `LevelTrade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LevelTradeHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionId]` on the table `level_stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number]` on the table `levels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `level_stocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `levels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LevelTrade" DROP CONSTRAINT "LevelTrade_stockId_fkey";

-- DropForeignKey
ALTER TABLE "LevelTrade" DROP CONSTRAINT "LevelTrade_tradeHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "LevelTradeHistory" DROP CONSTRAINT "LevelTradeHistory_LevelMembershipId_fkey";

-- DropForeignKey
ALTER TABLE "level_stocks" DROP CONSTRAINT "level_stocks_levelId_fkey";

-- DropIndex
DROP INDEX "level_stocks_level_id_idx";

-- DropIndex
DROP INDEX "name";

-- AlterTable
ALTER TABLE "LevelMembership" DROP COLUMN "starsCount",
ALTER COLUMN "passedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "level_stocks" DROP COLUMN "levelId",
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "levels" DROP COLUMN "firstStar",
DROP COLUMN "name",
DROP COLUMN "secondStar",
DROP COLUMN "startingBudget",
DROP COLUMN "thirdStar",
ADD COLUMN     "number" INTEGER NOT NULL;

-- DropTable
DROP TABLE "LevelTrade";

-- DropTable
DROP TABLE "LevelTradeHistory";

-- CreateTable
CREATE TABLE "LevelQuestion" (
    "id" SERIAL NOT NULL,
    "answer" "TradeType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "levelId" INTEGER NOT NULL,
    "levelStockId" INTEGER NOT NULL,

    CONSTRAINT "LevelQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "level_stocks_questionId_key" ON "level_stocks"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "levels_number_key" ON "levels"("number");

-- CreateIndex
CREATE INDEX "levels_number_idx" ON "levels"("number");

-- AddForeignKey
ALTER TABLE "LevelQuestion" ADD CONSTRAINT "LevelQuestion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_stocks" ADD CONSTRAINT "level_stocks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LevelQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
