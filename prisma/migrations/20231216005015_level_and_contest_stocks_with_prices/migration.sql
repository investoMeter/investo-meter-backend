/*
  Warnings:

  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockPrice" DROP CONSTRAINT "StockPrice_stockId_fkey";

-- DropTable
DROP TABLE "Stock";

-- DropTable
DROP TABLE "StockPrice";

-- CreateTable
CREATE TABLE "ContestStockPrice" (
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

    CONSTRAINT "ContestStockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestStock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "ContestStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelStockPrice" (
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

    CONSTRAINT "LevelStockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelStock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "LevelStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestStock_symbol_key" ON "ContestStock"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "LevelStock_symbol_key" ON "LevelStock"("symbol");

-- AddForeignKey
ALTER TABLE "ContestStockPrice" ADD CONSTRAINT "ContestStockPrice_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "ContestStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelStockPrice" ADD CONSTRAINT "LevelStockPrice_levelStockId_fkey" FOREIGN KEY ("levelStockId") REFERENCES "LevelStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
