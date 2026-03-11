import { Router, type Request, type Response } from "express";
import { prisma } from "db/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthInput, PostSignUp, SigninInput } from "../../types";

const userRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not present, Check .env file.")
}

userRouter.post("/signup", async (req: Request, res: Response) => {
  const parsed = AuthInput.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Incorrect inputs",
      issues: parsed.error.issues,
    });
    return;
  }

  const { email, password, firstName, lastName, phoneNumber } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber
      },
    });


    const token = jwt.sign(
      { sub: user.userId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: cookieMaxAge * 1000,
      })
      .json({
        message: "Logged in",
        jwt: token,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
      });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  const parsed = SigninInput.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid input",
      issues: parsed.error.issues,
    });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { sub: existingUser.userId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: cookieMaxAge * 1000,
      })
      .json({
        message: "Logged in",
        jwt: token,
        userId: existingUser.userId,
        email: existingUser.email,
        firstName: existingUser.firstName,
      });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/post-signup", async (req: Request, res: Response) => {
  const parsed = PostSignUp.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      message: "Incorrect inputs",
      issues: parsed.error.issues,
    });
    return;
  }

  const {
    email,
    height,
    currentWeight,
    gender,
    avgWorkoutMinutes,
    workoutDaysPerWeek,
    birthDate,
    goalWeight,
    targetDuration,
    activityLevel,
    bodyGoals,
    endDate,
  } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      res.status(409).json({ message: "User dosen't exists" });
      return;
    }

    // All of these fields are required to create personalInfo and targets
    if (
      height == null ||
      currentWeight == null ||
      gender == null ||
      avgWorkoutMinutes == null ||
      workoutDaysPerWeek == null ||
      birthDate == null ||
      goalWeight == null ||
      targetDuration == null ||
      activityLevel == null ||
      bodyGoals == null ||
      endDate == null
    ) {
      res.status(400).json({ message: "Missing required profile fields" });
      return;
    }

    // Keep same flow: this should be called once right after /signup
    const existingPersonalInfo = await prisma.personalInfo.findUnique({
      where: { userId: existingUser.userId },
    });
    if (existingPersonalInfo) {
      res.status(409).json({ message: "Profile already created" });
      return;
    }

    await prisma.user.update({
      where: { email },
      data: {
        personalInfo: {
          create: {
            height,
            gender,
            avgWorkoutMinutes,
            workoutDaysPerWeek,
            birthDate,
            weightProgress: {
              create: {
                currentWeight: String(currentWeight),
                targetWeight: String(goalWeight),
              },
            },
          },
        },
        targets: {
          create: {
            targetDuration,
            activityLevel,
            bodyGoals,
            endDate,
          },
        },
      },
    });

    return res
      .status(200)
      .json({
        message: "Profile Created",
      });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  };
})


export default userRouter;