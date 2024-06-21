-- DropIndex
DROP INDEX "ContestMembership_contestId_roomNumber_idx";

-- DropIndex
DROP INDEX "users_username_idx";

-- CreateIndex
CREATE INDEX "ContestMembership_contestId_roomNumber_currentMoneyAmount_idx" ON "ContestMembership"("contestId", "roomNumber", "currentMoneyAmount");

-- CreateIndex
CREATE INDEX "users_id_username_idx" ON "users"("id", "username");
