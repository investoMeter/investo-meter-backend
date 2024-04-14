/*
  Warnings:

  - You are about to drop the column `number` on the `Room` table. All the data in the column will be lost.
  - Added the required column `roomNumber` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_contestId_roomId_fkey";

-- DropForeignKey
ALTER TABLE "contest_stock_price" DROP CONSTRAINT "contest_stock_price_contestStockId_fkey";

-- DropIndex
DROP INDEX "Room_contestId_key";

-- AlterTable
ALTER TABLE "Contest" ALTER COLUMN "startingMoney" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "number",
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "contest_stock_price" ADD COLUMN     "stockHistoryId" INTEGER;

-- AlterTable
ALTER TABLE "contest_stocks" ADD COLUMN     "contestId" INTEGER;

-- CreateTable
CREATE TABLE "StockHistory" (
    "id" SERIAL NOT NULL,
    "contestStockId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "roomContestId" INTEGER,
    "roomId" INTEGER,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_stock_price" ADD CONSTRAINT "contest_stock_price_stockHistoryId_fkey" FOREIGN KEY ("stockHistoryId") REFERENCES "StockHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_stocks" ADD CONSTRAINT "contest_stocks_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_roomContestId_roomId_fkey" FOREIGN KEY ("roomContestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE SET NULL ON UPDATE CASCADE;
