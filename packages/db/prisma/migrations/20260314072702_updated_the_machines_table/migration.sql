/*
  Warnings:

  - Added the required column `category` to the `Machines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Machines" ADD COLUMN     "category" TEXT NOT NULL;
