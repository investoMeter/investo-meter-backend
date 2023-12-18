/*
  Warnings:

  - You are about to drop the `ContestStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContestStockPrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LevelStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LevelStockPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- DropForeignKey
ALTER TABLE "ContestStockPrice" DROP CONSTRAINT "ContestStockPrice_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "LevelStockPrice" DROP CONSTRAINT "LevelStockPrice_levelStockId_fkey";

-- DropTable
DROP TABLE "ContestStock";

-- DropTable
DROP TABLE "ContestStockPrice";

-- DropTable
DROP TABLE "LevelStock";

-- DropTable
DROP TABLE "LevelStockPrice";

-- CreateTable
CREATE TABLE "contest_stock_price" (
    "id" SERIAL NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "highestPrice" DOUBLE PRECISION NOT NULL,
    "lowestPrice" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "contestStockId" INTEGER NOT NULL,

    CONSTRAINT "contest_stock_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_stocks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "contest_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelMembership" (
    "id" SERIAL NOT NULL,
    "failuresCount" INTEGER NOT NULL,
    "starsCount" INTEGER NOT NULL,
    "passedAt" TIMESTAMP(3) NOT NULL,
    "playerId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "LevelMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_stock_price" (
    "id" SERIAL NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "highestPrice" DOUBLE PRECISION NOT NULL,
    "lowestPrice" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "levelStockId" INTEGER NOT NULL,

    CONSTRAINT "level_stock_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_stocks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "level_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelTrade" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tradetype" "TradeType" NOT NULL,
    "stockId" INTEGER NOT NULL,

    CONSTRAINT "LevelTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startingBudget" DOUBLE PRECISION NOT NULL,
    "firstGoal" INTEGER NOT NULL,
    "secondGoal" INTEGER NOT NULL,
    "thirdGoal" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorials" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contest_stock_price_contest_stock_id_foreign" ON "contest_stock_price"("contestStockId");

-- CreateIndex
CREATE UNIQUE INDEX "contest_stocks_symbol_key" ON "contest_stocks"("symbol");

-- CreateIndex
CREATE INDEX "symbol" ON "contest_stocks"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "LevelMembership_levelId_playerId_key" ON "LevelMembership"("levelId", "playerId");

-- CreateIndex
CREATE INDEX "level_stock_price_level_stock_id_idx" ON "level_stock_price"("levelStockId");

-- CreateIndex
CREATE INDEX "level_stocks_level_id_idx" ON "level_stocks"("levelId");

-- CreateIndex
CREATE INDEX "name" ON "levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tutorials_levelId_key" ON "tutorials"("levelId");

-- CreateIndex
CREATE INDEX "authorId" ON "tutorials"("authorId");

-- CreateIndex
CREATE INDEX "levelId" ON "tutorials"("levelId");

-- AddForeignKey
ALTER TABLE "contest_stock_price" ADD CONSTRAINT "contest_stock_price_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelMembership" ADD CONSTRAINT "LevelMembership_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelMembership" ADD CONSTRAINT "LevelMembership_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_stock_price" ADD CONSTRAINT "level_stock_price_levelStockId_fkey" FOREIGN KEY ("levelStockId") REFERENCES "level_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_stocks" ADD CONSTRAINT "level_stocks_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelTrade" ADD CONSTRAINT "LevelTrade_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "level_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admins"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
