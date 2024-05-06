/*
  Warnings:

  - Made the column `stockHistoryId` on table `contest_stock_price` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "contest_stock_price" DROP CONSTRAINT "contest_stock_price_stockHistoryId_fkey";

-- AlterTable
ALTER TABLE "contest_stock_price" ALTER COLUMN "stockHistoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "contest_stock_price" ADD CONSTRAINT "contest_stock_price_stockHistoryId_fkey" FOREIGN KEY ("stockHistoryId") REFERENCES "StockHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
