/*
  Warnings:

  - You are about to drop the column `currentWeight` on the `PersonalInfo` table. All the data in the column will be lost.
  - You are about to drop the column `goalWeight` on the `Target` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonalInfo" DROP COLUMN "currentWeight";

-- AlterTable
ALTER TABLE "Target" DROP COLUMN "goalWeight";

-- CreateTable
CREATE TABLE "WeightProgress" (
    "weightId" TEXT NOT NULL,
    "currentWeight" TEXT NOT NULL,
    "targetWeight" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalInfoId" TEXT NOT NULL,

    CONSTRAINT "WeightProgress_pkey" PRIMARY KEY ("weightId")
);

-- CreateIndex
CREATE INDEX "weight_progress_personal_info_id_idx" ON "WeightProgress"("personalInfoId");

-- CreateIndex
CREATE INDEX "weight_progress_created_at_idx" ON "WeightProgress"("createdAt");

-- CreateIndex
CREATE INDEX "weight_progress_updated_at_idx" ON "WeightProgress"("updatedAt");

-- AddForeignKey
ALTER TABLE "WeightProgress" ADD CONSTRAINT "WeightProgress_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "PersonalInfo"("personalInfoId") ON DELETE RESTRICT ON UPDATE CASCADE;
