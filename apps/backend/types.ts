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

const BaseProfileFields = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(10).max(10).optional(),
  password: z.string().min(1).optional(),
  height: z.coerce.number().optional(),
  currentWeight: z.coerce.number().optional(),
  gender: z.enum(["Male", "Female", "NonBinary", "PreferNotToSay"]).optional(),
  avgWorkoutMinutes: z.coerce.number().optional(),
  workoutDaysPerWeek: z.coerce.number().optional(),
  birthDate: z.coerce.date().optional(),
  goalWeight: z.coerce.number().optional(),
  targetDuration: z.string(),
  activityLevel: z.enum(["Newbie", "Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  bodyGoals: z.enum([
    "WEIGHT_LOSS",
    "WEIGHT_GAIN",
    "MASS_GAIN",
    "LEAN_MUSCLE_GAIN",
    "STRENGTH_GAIN",
    "ENDURANCE_GAIN",
    "BALANCED_GAIN",
  ]).optional(),
  endDate: z.coerce.date().optional(),
});

export const UpdateProfile = BaseProfileFields.partial().extend({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(1).optional(),
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
  days: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]).optional()
});

export const UpdateMachineInput = z.object({
  name: z.string().min(1),
});

export const PostSignUp = BaseProfileFields;

