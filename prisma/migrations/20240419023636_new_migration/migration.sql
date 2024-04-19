/*
  Warnings:

  - You are about to drop the column `stockCount` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `price` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradeType` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ContestMembership" ALTER COLUMN "currentMoneyAmount" SET DEFAULT 0.0,
ALTER COLUMN "currentMoneyAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "stockCount",
DROP COLUMN "type",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tradeType" "TradeType" NOT NULL;

-- CreateTable
CREATE TABLE "BuyRequest" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL,
    "playerId" TEXT NOT NULL,
    "contestStockId" INTEGER NOT NULL,
    "roomContestId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "BuyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellRequest" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL,
    "playerId" TEXT NOT NULL,
    "contestStockId" INTEGER NOT NULL,
    "roomContestId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "SellRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_roomContestId_roomId_fkey" FOREIGN KEY ("roomContestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_roomContestId_roomId_fkey" FOREIGN KEY ("roomContestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
