import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// pg/SCRAM require password to be a string; URL without user@ leaves password undefined
if (!connectionString.includes("@")) {
  connectionString = connectionString.replace(
    /^(postgres(?:ql)?:\/\/)/i,
    "$1postgres:@"
  );
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });