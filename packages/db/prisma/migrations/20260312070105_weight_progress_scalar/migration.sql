-- AlterTable
ALTER TABLE "WeightProgress" ALTER COLUMN "currentWeight" SET NOT NULL,
ALTER COLUMN "currentWeight" SET DATA TYPE TEXT,
ALTER COLUMN "targetWeight" SET NOT NULL,
ALTER COLUMN "targetWeight" SET DATA TYPE TEXT;
