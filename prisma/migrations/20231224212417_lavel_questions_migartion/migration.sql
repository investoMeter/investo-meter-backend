/*
  Warnings:

  - Added the required column `questionId` to the `level_stocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "level_stocks" ADD COLUMN     "questionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "LevelStockQuestion" (
    "id" SERIAL NOT NULL,
    "answer" "TradeType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "levelStockId" INTEGER NOT NULL,

    CONSTRAINT "LevelStockQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelStockQuestion_levelStockId_key" ON "LevelStockQuestion"("levelStockId");

-- AddForeignKey
ALTER TABLE "LevelStockQuestion" ADD CONSTRAINT "LevelStockQuestion_levelStockId_fkey" FOREIGN KEY ("levelStockId") REFERENCES "level_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
