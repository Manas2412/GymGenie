import { Router } from "express"; 
import userRouter from "./user.js"
import userProfileRouter from "./profile.js";
import workoutRouter from "./workout.js";
import machineRouter from "./machine.js";

const router = Router();

router.use("/user", userRouter)
router.use("/user-profile", userProfileRouter)
router.use("/workout", workoutRouter)
router.use("/machines", machineRouter)

export default router;