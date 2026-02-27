import { Router } from "express"; 
import userRouter from "./user.js"
import userProfileRouter from "./profile.js";

const router = Router();

router.use("/user", userRouter)
router.use("/user-profile", userProfileRouter)

export default router;