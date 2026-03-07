import z from "zod";



export const UpdateProfile = z.object({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().min(10).max(10).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    password: z.string().optional(),
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