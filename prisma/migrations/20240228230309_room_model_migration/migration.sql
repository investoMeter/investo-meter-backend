/*
  Warnings:

  - You are about to drop the column `rooms` on the `Contest` table. All the data in the column will be lost.
  - Added the required column `maxRoomCapacity` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startingMoney` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_contestId_fkey";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "rooms",
ADD COLUMN     "maxRoomCapacity" INTEGER NOT NULL,
ADD COLUMN     "startingMoney" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("contestId","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_key" ON "Room"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_contestId_key" ON "Room"("contestId");

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_roomId_fkey" FOREIGN KEY ("contestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
