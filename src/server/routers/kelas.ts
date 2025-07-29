import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, createProtectedProcedure } from "../trpc";
import { Permission } from "../../lib/permissions";

export const kelasRouter = router({
  // Public untuk dropdown
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.kelas.findMany({
      orderBy: { nama_kelas: "asc" },
    });
  }),

  // CRUD hanya untuk ADMINISTRATOR
  getAllWithDetails: createProtectedProcedure(Permission.CRUD_DATA_KELAS)
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            nama_kelas: { contains: search, mode: "insensitive" as const },
          }
        : {};

      const [kelas, total] = await Promise.all([
        ctx.prisma.kelas.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                siswa: true,
              },
            },
          },
          orderBy: { nama_kelas: "asc" },
        }),
        ctx.prisma.kelas.count({ where }),
      ]);

      return {
        kelas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  create: createProtectedProcedure(Permission.CRUD_DATA_KELAS)
    .input(
      z.object({
        nama_kelas: z.string().min(1, "Nama kelas harus diisi"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingKelas = await ctx.prisma.kelas.findUnique({
        where: { nama_kelas: input.nama_kelas },
      });

      if (existingKelas) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nama kelas sudah terdaftar",
        });
      }

      const kelas = await ctx.prisma.kelas.create({
        data: input,
        include: {
          _count: {
            select: {
              siswa: true,
            },
          },
        },
      });

      return kelas;
    }),

  update: createProtectedProcedure(Permission.CRUD_DATA_KELAS)
    .input(
      z.object({
        id: z.string(),
        nama_kelas: z.string().min(1, "Nama kelas harus diisi"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingKelas = await ctx.prisma.kelas.findUnique({
        where: { id: input.id },
      });

      if (!existingKelas) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kelas tidak ditemukan",
        });
      }

      if (input.nama_kelas !== existingKelas.nama_kelas) {
        const duplicateName = await ctx.prisma.kelas.findUnique({
          where: { nama_kelas: input.nama_kelas },
        });

        if (duplicateName) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Nama kelas sudah terdaftar",
          });
        }
      }

      const kelas = await ctx.prisma.kelas.update({
        where: { id: input.id },
        data: { nama_kelas: input.nama_kelas },
        include: {
          _count: {
            select: {
              siswa: true,
            },
          },
        },
      });

      return kelas;
    }),

  delete: createProtectedProcedure(Permission.CRUD_DATA_KELAS)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingKelas = await ctx.prisma.kelas.findUnique({
        where: { id: input.id },
        include: {
          siswa: true,
        },
      });

      if (!existingKelas) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kelas tidak ditemukan",
        });
      }

      if (existingKelas.siswa.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tidak dapat menghapus kelas yang masih memiliki siswa",
        });
      }

      await ctx.prisma.kelas.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Kelas berhasil dihapus" };
    }),
});
