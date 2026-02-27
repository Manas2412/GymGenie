import { Router } from "express";
import { prisma } from "db/index";
import bcrypt from "bcrypt";
import authMiddleware from "./middleware";

const workoutRouter = Router();

workoutRouter.get("/get-workouts", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "unauthorized" })
        return;
    }

    try {
        const userWorkouts = await prisma.workout.findMany({
            where: {
                userId
            }
        })
         
        if (!userWorkouts) {
            res.status(404).json({ message: "No workout created yet" });
            return;
        }

        res.sendStatus(200).json({
            userWorkouts
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error in fetching user workouts" })
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

        res.sendStatus(200).json({
            message: "Workout deleted successfully"
        })

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