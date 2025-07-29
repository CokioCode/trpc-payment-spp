import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { signToken } from "../../lib/jwt";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        nama: z.string().min(2),
        role: z.enum(["ADMINISTRATOR", "PETUGAS", "SISWA"]).default("SISWA"),
        siswaId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, nama, role, siswaId } = input;

      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      if (siswaId) {
        const siswa = await ctx.prisma.siswa.findUnique({
          where: { id: siswaId },
        });
        if (!siswa) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Siswa not found",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nama,
          role,
          siswaId,
        },
        include: {
          siswa: true,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        siswaId: user.siswaId || undefined,
        nama: user.nama,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          siswa: user.siswa,
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { email },
        include: {
          siswa: {
            include: {
              kelas: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = signToken({
        userId: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        siswaId: user.siswaId || undefined,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          siswa: user.siswa,
        },
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
      siswa: user.siswa,
    };
  }),
});
