/*
  Warnings:

  - A unique constraint covering the columns `[contestStockId]` on the table `StockHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_contestStockId_key" ON "StockHistory"("contestStockId");
