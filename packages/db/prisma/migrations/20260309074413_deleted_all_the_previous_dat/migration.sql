/*
  Warnings:

  - You are about to drop the column `days` on the `Workout` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "days";

-- DropEnum
DROP TYPE "Days";
