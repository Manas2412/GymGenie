import { Router } from "express";
import { prisma } from "db/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthInput, SigninInput } from "../../types";

const userRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not present, Check .env file.")
}

userRouter.post("/signup", async (req, res) => {
  const parsed = AuthInput.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Incorrect inputs",
      issues: parsed.error.issues,
    });
    return;
  }

  const { email, password, firstName, lastName, phoneNumber} = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

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


    res.status(201).json({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/signin", async (req, res) => {
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
    res
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
        firstName: existingUser.firstName
      });
      console.log(token)
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default userRouter;