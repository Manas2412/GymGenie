/*
  Warnings:

  - Added the required column `days` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Days" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "days" "Days" NOT NULL;
