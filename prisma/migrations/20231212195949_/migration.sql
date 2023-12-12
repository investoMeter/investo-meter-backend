-- CreateTable
CREATE TABLE "StockPrice" (
    "id" SERIAL NOT NULL,
    "openPrice" DECIMAL(65,30) NOT NULL,
    "closePrice" DECIMAL(65,30) NOT NULL,
    "highestPrice" DECIMAL(65,30) NOT NULL,
    "lowestPrice" DECIMAL(65,30) NOT NULL,
    "volume" BIGINT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "stockId" INTEGER NOT NULL,

    CONSTRAINT "StockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");

-- AddForeignKey
ALTER TABLE "StockPrice" ADD CONSTRAINT "StockPrice_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
