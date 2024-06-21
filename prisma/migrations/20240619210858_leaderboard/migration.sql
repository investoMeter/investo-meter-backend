-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Leaderboard_contestId_roomNumber_score_idx" ON "Leaderboard"("contestId", "roomNumber", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_username_contestId_roomNumber_key" ON "Leaderboard"("username", "contestId", "roomNumber");

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
