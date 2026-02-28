import { Router } from "express";
import { prisma } from "db/index";
import authMiddleware from "./middleware";
import { UpdateMachineInput } from "../../types";

const machineRouter = Router();

machineRouter.get("/get-machines", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const machines = await prisma.machines.findMany({
            where: { userId },
        });

        return res.status(200).json({
            machines,
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error in fetching machines",
            success: false,
        });
    }
});

machineRouter.patch("/update-machine/:machineId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const machineIdParam = req.params.machineId;
    const machineId = typeof machineIdParam === "string" ? machineIdParam : undefined;
    if (!machineId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(machineId)) {
        return res.status(400).json({
            message: "Invalid machineId",
            success: false,
        });
    }

    try {
        const parsed = UpdateMachineInput.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid input",
                issues: parsed.error.issues,
                success: false,
            });
        }
        const { name } = parsed.data;

        const existing = await prisma.machines.findFirst({
            where: { machineId, userId },
        });
        if (!existing) {
            return res.status(404).json({
                message: "Machine not found",
                success: false,
            });
        }

        const updated = await prisma.machines.update({
            where: { machineId },
            data: { name },
        });

        return res.status(200).json({
            message: "Machine updated successfully",
            machine: updated,
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error updating the machine",
            success: false,
        });
    }
});

machineRouter.delete("/delete-machine/:machineId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const machineIdParam = req.params.machineId;
    const machineId = typeof machineIdParam === "string" ? machineIdParam : undefined;
    if (!machineId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(machineId)) {
        return res.status(400).json({
            message: "Invalid machineId",
            success: false,
        });
    }

    try {
        const existing = await prisma.machines.findFirst({
            where: { machineId, userId },
        });
        if (!existing) {
            return res.status(404).json({
                message: "Machine not found",
                success: false,
            });
        }

        await prisma.machines.delete({
            where: { machineId },
        });

        return res.status(200).json({
            message: "Machine deleted successfully",
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error in deleting machine",
            success: false,
        });
    }
});


export default machineRouter;