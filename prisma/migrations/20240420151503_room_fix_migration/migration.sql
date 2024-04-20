/*
  Warnings:

  - You are about to drop the column `roomId` on the `ContestMembership` table. All the data in the column will be lost.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `StockHistory` table. All the data in the column will be lost.
  - Added the required column `roomNumber` to the `ContestMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_contestId_roomId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_roomContestId_roomId_fkey";

-- DropIndex
DROP INDEX "Room_id_key";

-- AlterTable
ALTER TABLE "ContestMembership" DROP COLUMN "roomId",
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("contestId", "roomNumber");

-- AlterTable
ALTER TABLE "StockHistory" DROP COLUMN "roomId",
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_roomContestId_roomNumber_fkey" FOREIGN KEY ("roomContestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
