-- CreateEnum
CREATE TYPE "BodyGoals" AS ENUM ('WEIGHT_LOSS', 'WEIGHT_GAIN', 'MASS_GAIN', 'LEAN_MUSCLE_GAIN', 'STRENGTH_GAIN', 'ENDURANCE_GAIN', 'BALANCED_GAIN');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'NonBinary', 'PreferNotToSay');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "personalInfoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "avgWorkoutMinutes" INTEGER NOT NULL,
    "workoutDaysPerWeek" INTEGER NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("personalInfoId")
);

-- CreateTable
CREATE TABLE "Target" (
    "targetId" TEXT NOT NULL,
    "currentWeight" INTEGER NOT NULL,
    "goalWeight" INTEGER NOT NULL,
    "targetDuration" TEXT NOT NULL,
    "activityLevel" "ActivityLevel" NOT NULL,
    "bodyGoals" "BodyGoals" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("targetId")
);

-- CreateTable
CREATE TABLE "Machines" (
    "machineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Machines_pkey" PRIMARY KEY ("machineId")
);

-- CreateTable
CREATE TABLE "Workout" (
    "workoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("workoutId")
);

-- CreateTable
CREATE TABLE "Chest" (
    "chestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Chest_pkey" PRIMARY KEY ("chestId")
);

-- CreateTable
CREATE TABLE "Shoulders" (
    "shouldersId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Shoulders_pkey" PRIMARY KEY ("shouldersId")
);

-- CreateTable
CREATE TABLE "Back" (
    "backId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Back_pkey" PRIMARY KEY ("backId")
);

-- CreateTable
CREATE TABLE "Arms" (
    "armsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Arms_pkey" PRIMARY KEY ("armsId")
);

-- CreateTable
CREATE TABLE "Legs" (
    "legsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Legs_pkey" PRIMARY KEY ("legsId")
);

-- CreateTable
CREATE TABLE "Core" (
    "coreId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Core_pkey" PRIMARY KEY ("coreId")
);

-- CreateTable
CREATE TABLE "Cardio" (
    "cardioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Cardio_pkey" PRIMARY KEY ("cardioId")
);

-- CreateTable
CREATE TABLE "Biceps" (
    "bicepsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "armsId" TEXT NOT NULL,

    CONSTRAINT "Biceps_pkey" PRIMARY KEY ("bicepsId")
);

-- CreateTable
CREATE TABLE "Triceps" (
    "tricepsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "armsId" TEXT NOT NULL,

    CONSTRAINT "Triceps_pkey" PRIMARY KEY ("tricepsId")
);

-- CreateTable
CREATE TABLE "Forearms" (
    "forearmsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "armsId" TEXT NOT NULL,

    CONSTRAINT "Forearms_pkey" PRIMARY KEY ("forearmsId")
);

-- CreateTable
CREATE TABLE "Quads" (
    "quadsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "legsId" TEXT NOT NULL,

    CONSTRAINT "Quads_pkey" PRIMARY KEY ("quadsId")
);

-- CreateTable
CREATE TABLE "Hamstrings" (
    "hamstringsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "legsId" TEXT NOT NULL,

    CONSTRAINT "Hamstrings_pkey" PRIMARY KEY ("hamstringsId")
);

-- CreateTable
CREATE TABLE "Calves" (
    "calvesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "legsId" TEXT NOT NULL,

    CONSTRAINT "Calves_pkey" PRIMARY KEY ("calvesId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_userId_key" ON "PersonalInfo"("userId");

-- CreateIndex
CREATE INDEX "personal_info_user_id_idx" ON "PersonalInfo"("userId");

-- CreateIndex
CREATE INDEX "target_user_id_idx" ON "Target"("userId");

-- CreateIndex
CREATE INDEX "workout_created_at_idx" ON "Workout"("createdAt");

-- CreateIndex
CREATE INDEX "workout_user_id_idx" ON "Workout"("userId");

-- CreateIndex
CREATE INDEX "chest_workout_id_idx" ON "Chest"("workoutId");

-- CreateIndex
CREATE INDEX "shoulders_workout_id_idx" ON "Shoulders"("workoutId");

-- CreateIndex
CREATE INDEX "back_workout_id_idx" ON "Back"("workoutId");

-- CreateIndex
CREATE INDEX "arms_workout_id_idx" ON "Arms"("workoutId");

-- CreateIndex
CREATE INDEX "legs_workout_id_idx" ON "Legs"("workoutId");

-- CreateIndex
CREATE INDEX "core_workout_id_idx" ON "Core"("workoutId");

-- CreateIndex
CREATE INDEX "cardio_workout_id_idx" ON "Cardio"("workoutId");

-- CreateIndex
CREATE INDEX "biceps_arms_id_idx" ON "Biceps"("armsId");

-- CreateIndex
CREATE INDEX "triceps_arms_id_idx" ON "Triceps"("armsId");

-- CreateIndex
CREATE INDEX "forearms_arms_id_idx" ON "Forearms"("armsId");

-- CreateIndex
CREATE INDEX "quads_legs_id_idx" ON "Quads"("legsId");

-- CreateIndex
CREATE INDEX "hamstrings_legs_id_idx" ON "Hamstrings"("legsId");

-- CreateIndex
CREATE INDEX "calves_legs_id_idx" ON "Calves"("legsId");

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chest" ADD CONSTRAINT "Chest_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shoulders" ADD CONSTRAINT "Shoulders_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Back" ADD CONSTRAINT "Back_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arms" ADD CONSTRAINT "Arms_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Legs" ADD CONSTRAINT "Legs_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Core" ADD CONSTRAINT "Core_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cardio" ADD CONSTRAINT "Cardio_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Biceps" ADD CONSTRAINT "Biceps_armsId_fkey" FOREIGN KEY ("armsId") REFERENCES "Arms"("armsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Triceps" ADD CONSTRAINT "Triceps_armsId_fkey" FOREIGN KEY ("armsId") REFERENCES "Arms"("armsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forearms" ADD CONSTRAINT "Forearms_armsId_fkey" FOREIGN KEY ("armsId") REFERENCES "Arms"("armsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quads" ADD CONSTRAINT "Quads_legsId_fkey" FOREIGN KEY ("legsId") REFERENCES "Legs"("legsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hamstrings" ADD CONSTRAINT "Hamstrings_legsId_fkey" FOREIGN KEY ("legsId") REFERENCES "Legs"("legsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calves" ADD CONSTRAINT "Calves_legsId_fkey" FOREIGN KEY ("legsId") REFERENCES "Legs"("legsId") ON DELETE RESTRICT ON UPDATE CASCADE;
