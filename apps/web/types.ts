import z from "zod";

export const UpdateProfile = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(10).max(10).optional(),

  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  password: z.string().optional(),

  // Match backend types: coerce number-like fields
  height: z.coerce.number().optional(),
  currentWeight: z.coerce.number().optional(),
  gender: z.enum(["Male", "Female", "NonBinary", "PreferNotToSay"]).optional(),
  avgWorkoutMinutes: z.coerce.number().optional(),
  workoutDaysPerWeek: z.coerce.number().optional(),

  birthDate: z.string().optional(),

  goalWeight: z.coerce.number().optional(),
  targetDuration: z.string().optional(),
  activityLevel: z
    .enum(["Newbie", "Beginner", "Intermediate", "Advanced", "Expert"])
    .optional(),
  bodyGoals: z
    .enum([
      "WEIGHT_LOSS",
      "WEIGHT_GAIN",
      "MASS_GAIN",
      "LEAN_MUSCLE_GAIN",
      "STRENGTH_GAIN",
      "ENDURANCE_GAIN",
      "BALANCED_GAIN",
    ])
    .optional(),

  endDate: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfile>;

// Shared domain types derived from UpdateProfileInput
export type Gender = NonNullable<UpdateProfileInput["gender"]>;
export type ActivityLevel = NonNullable<UpdateProfileInput["activityLevel"]>;
export type BodyGoals = NonNullable<UpdateProfileInput["bodyGoals"]>;

// Shapes that mirror the backend API responses
export type BackendPersonalInfo = {
  height?: number | null;
  currentWeight?: number | null;
  gender?: Gender | null;
  avgWorkoutMinutes?: number | null;
  workoutDaysPerWeek?: number | null;
  birthDate?: string | Date | null;
};

export type BackendTarget = {
  goalWeight?: number | null;
  targetDuration?: string | null;
  activityLevel?: ActivityLevel | null;
  bodyGoals?: BodyGoals | null;
  endDate?: string | Date | null;
};

export type BackendProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  personalInfo?: BackendPersonalInfo | null;
  targets?: BackendTarget[] | BackendTarget | null;
};

// Flattened backend profile used by forms
export type NormalizedProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  height?: number | null;
  currentWeight?: number | null;
  gender?: Gender | null;
  avgWorkoutMinutes?: number | null;
  workoutDaysPerWeek?: number | null;
  birthDate?: string | Date | null;
  goalWeight?: number | null;
  targetDuration?: string | null;
  activityLevel?: ActivityLevel | null;
  bodyGoals?: BodyGoals | null;
  endDate?: string | Date | null;
};

// Strongly-typed form state for the profile page
export type ProfileFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currentPassword?: string;
  newPassword?: string;
  height: string | number;
  currentWeight: string | number;
  gender: Gender | "";
  avgWorkoutMinutes: string | number;
  workoutDaysPerWeek: string | number;
  birthDate?: string;
  goalWeight: string | number;
  targetDuration: string;
  activityLevel: ActivityLevel | "";
  bodyGoals: BodyGoals | "";
  endDate?: string | Date | null;
};