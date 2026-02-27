/*
  Warnings:

  - Added the required column `userId` to the `Machines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Machines" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "machines_user_id_idx" ON "Machines"("userId");

-- AddForeignKey
ALTER TABLE "Machines" ADD CONSTRAINT "Machines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
