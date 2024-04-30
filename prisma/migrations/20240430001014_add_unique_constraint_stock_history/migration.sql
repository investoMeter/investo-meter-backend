/*
  Warnings:

  - A unique constraint covering the columns `[roomContestId,roomNumber,contestStockId]` on the table `StockHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StockHistory_contestStockId_key";

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_roomContestId_roomNumber_contestStockId_key" ON "StockHistory"("roomContestId", "roomNumber", "contestStockId");
