-- CreateIndex
CREATE INDEX "ContestMembership_contestId_roomNumber_currentBalance_idx" ON "ContestMembership"("contestId", "roomNumber", "currentBalance");
