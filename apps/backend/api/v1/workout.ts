import { Router } from "express";
import { prisma } from "db/index";
import authMiddleware from "./middleware";
import { UpdateWorkoutInput } from "../../types";

const workoutRouter = Router();

workoutRouter.get("/get-workouts", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    try {
        const userWorkouts = await prisma.workout.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                chest: true,
                shoulders: true,
                back: true,
                arms: {
                    include: {
                        biceps: true,
                        triceps: true,
                        forearms: true
                    }
                },
                legs: {
                    include: {
                        quads: true,
                        hamstrings: true,
                        calves: true
                    }
                },
                core: true,
                cardio: true,
            },
        });

        return res.status(200).json({
            userWorkouts,
            count: userWorkouts.length,
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error in fetching user workouts",
            success: false,
        });
    }
});

workoutRouter.delete("/delete-workout/:workoutId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }

    const workoutIdParam = req.params.workoutId;
    const workoutId = typeof workoutIdParam === "string" ? workoutIdParam : undefined;
    if (!workoutId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workoutId)) {
        return res.status(400).json({
            message: "Invalid workoutId",
            success: false,
        });
    }

    try {
        const existing = await prisma.workout.findFirst({
            where: { workoutId, userId },
        });
        if (!existing) {
            return res.status(404).json({
                message: "Workout not found",
                success: false,
            });
        }

        await prisma.$transaction(async (tx) => {
            const armsIds = (await tx.arms.findMany({ where: { workoutId }, select: { armsId: true } })).map((a) => a.armsId);
            if (armsIds.length > 0) {
                await tx.biceps.deleteMany({ where: { armsId: { in: armsIds } } });
                await tx.triceps.deleteMany({ where: { armsId: { in: armsIds } } });
                await tx.forearms.deleteMany({ where: { armsId: { in: armsIds } } });
            }
            const legsIds = (await tx.legs.findMany({ where: { workoutId }, select: { legsId: true } })).map((l) => l.legsId);
            if (legsIds.length > 0) {
                await tx.quads.deleteMany({ where: { legsId: { in: legsIds } } });
                await tx.hamstrings.deleteMany({ where: { legsId: { in: legsIds } } });
                await tx.calves.deleteMany({ where: { legsId: { in: legsIds } } });
            }
            await tx.chest.deleteMany({ where: { workoutId } });
            await tx.shoulders.deleteMany({ where: { workoutId } });
            await tx.back.deleteMany({ where: { workoutId } });
            await tx.arms.deleteMany({ where: { workoutId } });
            await tx.legs.deleteMany({ where: { workoutId } });
            await tx.core.deleteMany({ where: { workoutId } });
            await tx.cardio.deleteMany({ where: { workoutId } });
            await tx.workout.delete({ where: { workoutId } });
        });

        return res.status(200).json({
            message: "Workout deleted successfully",
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error in deleting user workout",
            success: false,
        });
    }
});

workoutRouter.patch("/update-workout/:workoutId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const workoutIdParam = req.params.workoutId;
    const workoutId = typeof workoutIdParam === "string" ? workoutIdParam : undefined;
    if (!workoutId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workoutId)) {
        return res.status(400).json({
            message: "Invalid workoutId",
            success: false,
        });
    }

    try {
        const parsed = UpdateWorkoutInput.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid input",
                issues: parsed.error.issues,
                success: false,
            });
        }
        const categories = parsed.data;

        const existing = await prisma.workout.findFirst({
            where: { workoutId, userId },
        });
        if (!existing) {
            return res.status(404).json({
                message: "Workout not found",
                success: false,
            });
        }

        await prisma.$transaction(async (tx) => {
            if (categories.chest !== undefined) {
                await tx.chest.deleteMany({ where: { workoutId } });
                if (categories.chest.length > 0) {
                    await tx.chest.createMany({
                        data: categories.chest.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.shoulders !== undefined) {
                await tx.shoulders.deleteMany({ where: { workoutId } });
                if (categories.shoulders.length > 0) {
                    await tx.shoulders.createMany({
                        data: categories.shoulders.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.back !== undefined) {
                await tx.back.deleteMany({ where: { workoutId } });
                if (categories.back.length > 0) {
                    await tx.back.createMany({
                        data: categories.back.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.arms !== undefined) {
                const armsIds = (await tx.arms.findMany({ where: { workoutId }, select: { armsId: true } })).map((a) => a.armsId);
                if (armsIds.length > 0) {
                    await tx.biceps.deleteMany({ where: { armsId: { in: armsIds } } });
                    await tx.triceps.deleteMany({ where: { armsId: { in: armsIds } } });
                    await tx.forearms.deleteMany({ where: { armsId: { in: armsIds } } });
                }
                await tx.arms.deleteMany({ where: { workoutId } });
                if (categories.arms.length > 0) {
                    await tx.arms.createMany({
                        data: categories.arms.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.legs !== undefined) {
                const legsIds = (await tx.legs.findMany({ where: { workoutId }, select: { legsId: true } })).map((l) => l.legsId);
                if (legsIds.length > 0) {
                    await tx.quads.deleteMany({ where: { legsId: { in: legsIds } } });
                    await tx.hamstrings.deleteMany({ where: { legsId: { in: legsIds } } });
                    await tx.calves.deleteMany({ where: { legsId: { in: legsIds } } });
                }
                await tx.legs.deleteMany({ where: { workoutId } });
                if (categories.legs.length > 0) {
                    await tx.legs.createMany({
                        data: categories.legs.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.core !== undefined) {
                await tx.core.deleteMany({ where: { workoutId } });
                if (categories.core.length > 0) {
                    await tx.core.createMany({
                        data: categories.core.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
            if (categories.cardio !== undefined) {
                await tx.cardio.deleteMany({ where: { workoutId } });
                if (categories.cardio.length > 0) {
                    await tx.cardio.createMany({
                        data: categories.cardio.map((e) => ({ workoutId, ...e })),
                    });
                }
            }
        });

        const updated = await prisma.workout.findUnique({
            where: { workoutId },
            include: {
                chest: true,
                shoulders: true,
                back: true,
                arms: { include: { biceps: true, triceps: true, forearms: true } },
                legs: { include: { quads: true, hamstrings: true, calves: true } },
                core: true,
                cardio: true,
            },
        });

        return res.status(200).json({
            message: "Workout updated successfully",
            workout: updated,
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error in updating the workout",
            success: false,
        });
    }
});

workoutRouter.post("/generate-workout", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {

    } catch (err) {

    }
});


export default workoutRouter;