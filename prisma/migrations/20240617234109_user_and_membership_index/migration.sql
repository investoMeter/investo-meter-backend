-- CreateIndex
CREATE INDEX "ContestMembership_contestId_idx" ON "ContestMembership"("contestId");

-- CreateIndex
CREATE INDEX "ContestMembership_contestId_roomNumber_idx" ON "ContestMembership"("contestId", "roomNumber");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");
