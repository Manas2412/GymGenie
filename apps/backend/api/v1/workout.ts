import { Router } from "express";
import { prisma } from "db/index";
import authMiddleware from "./middleware";

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

        res.status(200).json({
            userWorkouts,
            count: userWorkouts.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error in fetching user workouts" });
    }
});

workoutRouter.delete("/delete-workout", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "unauthorized" })
        return;
    }

    try {
        const deletedWorkout = await prisma.workout.delete({
            where: {
                workoutId: req.params.workoutId as string
            }
        })

        if (!deletedWorkout) {
            res.status(404).json({ message: "Workout not found" });
            return;
        }

        res.status(200).json({
            message: "Workout deleted successfully",
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error in deleting user workout" })
    }
});

workoutRouter.patch("/generate-workout", authMiddleware, async (req, res) => {
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