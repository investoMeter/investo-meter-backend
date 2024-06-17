/*
  Warnings:

  - You are about to drop the column `contestStockId` on the `BuyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `contestStockId` on the `SellRequest` table. All the data in the column will be lost.
  - You are about to drop the column `contestStockId` on the `StockHistory` table. All the data in the column will be lost.
  - You are about to drop the column `roomContestId` on the `StockHistory` table. All the data in the column will be lost.
  - You are about to drop the `contest_stocks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contestId,roomNumber,stockId]` on the table `StockHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stockId` to the `BuyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `OwnedStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockId` to the `SellRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `StockHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockId` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_contestId_fkey";

-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "Contest_ContestStock" DROP CONSTRAINT "Contest_ContestStock_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "OwnedStock" DROP CONSTRAINT "OwnedStock_stockId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_contestId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_roomContestId_roomNumber_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_contestId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_stockId_fkey";

-- DropIndex
DROP INDEX "StockHistory_roomContestId_roomNumber_contestStockId_key";

-- AlterTable
ALTER TABLE "BuyRequest" DROP COLUMN "contestStockId",
ADD COLUMN     "stockId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OwnedStock" ADD COLUMN     "contestId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SellRequest" DROP COLUMN "contestStockId",
ADD COLUMN     "stockId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StockHistory" DROP COLUMN "contestStockId",
DROP COLUMN "roomContestId",
ADD COLUMN     "contestId" INTEGER NOT NULL,
ADD COLUMN     "stockId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "contest_stocks";

-- CreateTable
CREATE TABLE "contest_stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "contest_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_stock_symbol_key" ON "contest_stock"("symbol");

-- CreateIndex
CREATE INDEX "symbol" ON "contest_stock"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_contestId_roomNumber_stockId_key" ON "StockHistory"("contestId", "roomNumber", "stockId");

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "Contest_ContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest_ContestStock" ADD CONSTRAINT "Contest_ContestStock_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "Contest_ContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "Contest_ContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "Contest_ContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "Contest_ContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;
