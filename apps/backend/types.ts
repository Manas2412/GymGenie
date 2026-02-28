import { z } from "zod";


export const AuthInput = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().min(10).max(10),
  password: z.string().min(1)
});

export const SigninInput = AuthInput.pick({
  email: true,
  password: true,
});

export const UpdateProfile = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().min(10).max(10),
  password: z.string().min(1),
  height: z.string().optional(),
  currentWeight: z.string().optional(),
  gender: z.enum(["Male", "Female", "NonBinary", "PreferNotToSay"]).optional(),
  avgWorkoutMinutes: z.string().optional(),
  workoutDaysPerWeek: z.string().optional(),
  birthDate: z.string().optional(),
  goalWeight: z.string().optional(),
  targetDuration: z.string().optional(),
  activityLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  bodyGoals: z.enum(["WeightLoss", "WeightGain", "MassGain", "LeanMuscleGain", "StrengthGain", "EnduranceGain", "BalancedGain"]).optional(),
  endDate: z.string().optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1),
  reps: z.coerce.number().int().min(0),
  sets: z.coerce.number().int().min(0),
});

export const UpdateWorkoutInput = z.object({
  chest: z.array(exerciseSchema).optional(),
  shoulders: z.array(exerciseSchema).optional(),
  back: z.array(exerciseSchema).optional(),
  arms: z.array(exerciseSchema).optional(),
  legs: z.array(exerciseSchema).optional(),
  core: z.array(exerciseSchema).optional(),
  cardio: z.array(exerciseSchema).optional(),
  days: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).optional()
});

export const UpdateMachineInput = z.object({
  name: z.string().min(1),
});

