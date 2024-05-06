/*
  Warnings:

  - Added the required column `contestId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "contestId" INTEGER NOT NULL,
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
