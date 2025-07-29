import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import { ZodError } from "zod";
import { Permission, hasPermission } from "../lib/permissions";

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const createProtectedProcedure = (permission: Permission) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.user!.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required permission: ${permission}`,
      });
    }
    return next({ ctx });
  });
