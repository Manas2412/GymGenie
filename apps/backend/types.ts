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
})

