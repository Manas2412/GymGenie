import { Router } from "express";
import { prisma } from "db/index";
import bcrypt from "bcrypt";
import { UpdateProfile } from "../../types";
import authMiddleware from "./middleware";

const userProfileRouter = Router();

userProfileRouter.get("/get-profile", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "unauthorized" })
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { userId },
            include: {
                personalInfo: {
                    select: {
                        height: true,
                        gender: true,
                        avgWorkoutMinutes: true,
                        workoutDaysPerWeek: true,
                        birthDate: true,
                        weightProgress: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            select: {
                                currentWeight: true,
                                targetWeight: true,
                                createdAt: true,
                            },
                        },
                    }
                },
                targets: {
                    select: {
                        targetId: true,
                        targetDuration: true,
                        activityLevel: true,
                        bodyGoals: true,
                        endDate: true
                    }
                }
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const withRelations = user as typeof user & {
            personalInfo: typeof user.personalInfo;
            targets: typeof user.targets;
        };

        const latestProgress = withRelations.personalInfo?.weightProgress?.[0];

        // Never expose password hash in profile response
        res.status(200).json({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            personalInfo: withRelations.personalInfo
                ? {
                    ...withRelations.personalInfo,
                    currentWeight: latestProgress?.currentWeight ?? null,
                    goalWeight: latestProgress?.targetWeight ?? null,
                }
                : null,
            targets: withRelations.targets,
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 
            message: "Internal Server Error in fetching user profile" ,
            success: false,
        });
    }
});

userProfileRouter.patch("/update-profile", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const parsed = UpdateProfile.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
            return;
        }
        const body = parsed.data;

        const userUpdateData: Parameters<typeof prisma.user.update>[0]["data"] = {};
        if (body.email !== undefined) userUpdateData.email = body.email;
        if (body.firstName !== undefined) userUpdateData.firstName = body.firstName;
        if (body.lastName !== undefined) userUpdateData.lastName = body.lastName;
        if (body.phoneNumber !== undefined) userUpdateData.phoneNumber = body.phoneNumber;

        // Handle password change securely:
        // - Only run when BOTH currentPassword and newPassword are provided (user explicitly wants to change password)
        // - Compare currentPassword against stored hash
        if (body.currentPassword && body.newPassword) {
            const existingUser = await prisma.user.findUnique({
                where: { userId },
            });

            if (!existingUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const isCurrentValid = await bcrypt.compare(
                body.currentPassword,
                existingUser.password
            );

            if (!isCurrentValid) {
                res.status(400).json({
                    message: "Current password incorrect",
                    success: false,
                });
                return;
            }

            userUpdateData.password = await bcrypt.hash(body.newPassword, 10);
        } else if (body.currentPassword || body.newPassword) {
            // One of the fields is present without the other: treat as invalid password-change attempt
            res.status(400).json({
                message: "Both currentPassword and newPassword are required to change password",
                success: false,
            });
            return;
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { userId },
                data: userUpdateData,
            });

            const personalInfoFields = ["height", "gender", "avgWorkoutMinutes", "workoutDaysPerWeek", "birthDate"] as const;
            const hasPersonalInfo = personalInfoFields.some((k) => body[k] !== undefined);
            const hasWeights = body.currentWeight !== undefined || body.goalWeight !== undefined;
            if (hasPersonalInfo) {
                const piData: Record<string, unknown> = {};
                if (body.height !== undefined) piData.height = Number(body.height);
                if (body.gender !== undefined) piData.gender = body.gender;
                if (body.avgWorkoutMinutes !== undefined) piData.avgWorkoutMinutes = Number(body.avgWorkoutMinutes);
                if (body.workoutDaysPerWeek !== undefined) piData.workoutDaysPerWeek = Number(body.workoutDaysPerWeek);
                if (body.birthDate !== undefined) piData.birthDate = new Date(body.birthDate);
                const existingPi = await tx.personalInfo.findUnique({ where: { userId } });
                if (existingPi) {
                    await tx.personalInfo.update({
                        where: { userId },
                        data: piData as Parameters<typeof tx.personalInfo.update>[0]["data"],
                    });

                    if (hasWeights) {
                        const latest = await tx.weightProgress.findFirst({
                            where: { personalInfoId: existingPi.personalInfoId },
                            orderBy: { createdAt: "desc" },
                        });
                        const incomingCurrent =
                            body.currentWeight !== undefined
                                ? String(body.currentWeight)
                                : undefined;
                        const incomingTarget =
                            body.goalWeight !== undefined
                                ? String(body.goalWeight)
                                : undefined;

                        const nextCurrent = incomingCurrent ?? latest?.currentWeight;
                        const nextTarget = incomingTarget ?? latest?.targetWeight;

                        const didChange =
                            (incomingCurrent !== undefined &&
                                incomingCurrent !== latest?.currentWeight) ||
                            (incomingTarget !== undefined &&
                                incomingTarget !== latest?.targetWeight);

                        if (didChange && nextCurrent && nextTarget) {
                            await tx.weightProgress.create({
                                data: {
                                    personalInfoId: existingPi.personalInfoId,
                                    currentWeight: nextCurrent,
                                    targetWeight: nextTarget,
                                },
                            });
                        }
                    }
                } else {
                    const required = ["height", "gender", "avgWorkoutMinutes", "workoutDaysPerWeek", "birthDate"] as const;
                    const hasAll = required.every((k) => body[k] !== undefined);
                    if (hasAll) {
                        const createdPi = await tx.personalInfo.create({
                            data: {
                                userId,
                                height: Number(body.height),
                                gender: body.gender!,
                                avgWorkoutMinutes: Number(body.avgWorkoutMinutes),
                                workoutDaysPerWeek: Number(body.workoutDaysPerWeek),
                                birthDate: new Date(body.birthDate!),
                            },
                        });

                        const nextCurrent =
                            body.currentWeight !== undefined ? String(body.currentWeight) : undefined;
                        const nextTarget =
                            body.goalWeight !== undefined ? String(body.goalWeight) : undefined;
                        // Only create if frontend actually sent weights
                        if (nextCurrent && nextTarget) {
                            await tx.weightProgress.create({
                                data: {
                                    personalInfoId: createdPi.personalInfoId,
                                    currentWeight: nextCurrent,
                                    targetWeight: nextTarget,
                                },
                            });
                        }
                    }
                }
            }

            const targetFields = ["targetDuration", "activityLevel", "bodyGoals", "endDate"] as const;
            const hasTarget = targetFields.some((k) => body[k] !== undefined);
            if (hasTarget) {
                const targetData: Record<string, unknown> = {};
                if (body.targetDuration !== undefined) targetData.targetDuration = body.targetDuration;
                if (body.activityLevel !== undefined) targetData.activityLevel = body.activityLevel;
                if (body.bodyGoals !== undefined) targetData.bodyGoals = body.bodyGoals;
                if (body.endDate !== undefined) targetData.endDate = new Date(body.endDate);
                const existing = await tx.target.findFirst({ where: { userId } });
                if (existing) {
                    await tx.target.update({
                        where: { targetId: existing.targetId },
                        data: targetData as Parameters<typeof tx.target.update>[0]["data"],
                    });
                } else {
                    await tx.target.create({
                        data: { userId, ...targetData } as Parameters<typeof tx.target.create>[0]["data"],
                    });
                }
            }
        });

        res.status(200).json({ 
            message: "Profile updated",
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            message: "Internal server error in updating the user profile" ,
            success: false,
        });
    }
});


export default userProfileRouter;