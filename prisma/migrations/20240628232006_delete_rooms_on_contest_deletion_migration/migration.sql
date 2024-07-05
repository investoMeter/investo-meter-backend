-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_contestId_fkey";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
