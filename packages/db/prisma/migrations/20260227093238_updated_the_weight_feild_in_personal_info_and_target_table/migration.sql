/*
  Warnings:

  - You are about to drop the column `weight` on the `PersonalInfo` table. All the data in the column will be lost.
  - You are about to drop the column `currentWeight` on the `Target` table. All the data in the column will be lost.
  - Added the required column `currentWeight` to the `PersonalInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PersonalInfo" DROP COLUMN "weight",
ADD COLUMN     "currentWeight" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Target" DROP COLUMN "currentWeight";
