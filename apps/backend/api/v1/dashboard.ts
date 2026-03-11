import { Router } from "express";
import { prisma } from "db/index";
import bcrypt from "bcrypt";
import { UpdateProfile } from "../../types";
import authMiddleware from "./middleware";

const dashboardRouter = Router();

dashboardRouter.get("/progress-tracker", authMiddleware, async (req, res) => {
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
                        weightProgress: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            select: {
                                currentWeight: true,
                                targetWeight: true,
                                createdAt: true,
                                updatedAt: true
                            },
                        },
                    }
                },
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const withRelations = user as typeof user & {
            personalInfo: typeof user.personalInfo;
        };

        const latestProgress = withRelations.personalInfo?.weightProgress?.[0];

        // Never expose password hash in profile response
        res.status(200).json({
            userId: user.userId,
            personalInfo: withRelations.personalInfo
                ? {
                    ...withRelations.personalInfo,
                    currentWeight: latestProgress?.currentWeight ?? null,
                    goalWeight: latestProgress?.targetWeight ?? null,
                }
                : null,
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




export default dashboardRouter;