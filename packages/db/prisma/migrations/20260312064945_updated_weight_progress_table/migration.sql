/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `WeightProgress` table. All the data in the column will be lost.
  - The `currentWeight` column on the `WeightProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `targetWeight` column on the `WeightProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "weight_progress_updated_at_idx";

-- AlterTable
ALTER TABLE "WeightProgress" DROP COLUMN "updatedAt",
DROP COLUMN "currentWeight",
ADD COLUMN     "currentWeight" TEXT[],
DROP COLUMN "targetWeight",
ADD COLUMN     "targetWeight" TEXT[];
