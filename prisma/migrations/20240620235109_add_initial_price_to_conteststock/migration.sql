/*
  Warnings:

  - A unique constraint covering the columns `[initialPriceId]` on the table `contest_stock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `initialPriceId` to the `contest_stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contest_stock_price" DROP CONSTRAINT "contest_stock_price_stockHistoryId_fkey";

-- AlterTable
ALTER TABLE "contest_stock" ADD COLUMN     "initialPriceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "contest_stock_price" ALTER COLUMN "stockHistoryId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contest_stock_initialPriceId_key" ON "contest_stock"("initialPriceId");

-- AddForeignKey
ALTER TABLE "contest_stock_price" ADD CONSTRAINT "contest_stock_price_stockHistoryId_fkey" FOREIGN KEY ("stockHistoryId") REFERENCES "StockHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_stock" ADD CONSTRAINT "contest_stock_initialPriceId_fkey" FOREIGN KEY ("initialPriceId") REFERENCES "contest_stock_price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
