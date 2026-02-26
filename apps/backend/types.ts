import { z } from "zod";


export const AuthInput = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().min(10).max(10),
  password: z.string().min(1)
});

export const SigninInput = AuthInput.pick({
  email: true,
  password: true,
});

