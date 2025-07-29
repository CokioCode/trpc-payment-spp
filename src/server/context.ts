import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export interface Context {
  user: JWTPayload | null;
  prisma: typeof prisma;
}

export const createContext = async (): Promise<Context> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user: JWTPayload | null = null;

  if (token) {
    user = verifyToken(token);
  }

  return {
    user,
    prisma,
  };
};
