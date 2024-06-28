-- DropForeignKey
ALTER TABLE "ContestStockPrice" DROP CONSTRAINT "ContestStockPrice_stockHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_contestId_stockId_fkey";

-- AddForeignKey
ALTER TABLE "ContestStockPrice" ADD CONSTRAINT "ContestStockPrice_stockHistoryId_fkey" FOREIGN KEY ("stockHistoryId") REFERENCES "StockHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE CASCADE ON UPDATE CASCADE;
