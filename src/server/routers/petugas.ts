import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, createProtectedProcedure } from "../trpc";
import { Permission } from "../../lib/permissions";

export const petugasRouter = router({
  getAll: createProtectedProcedure(Permission.CRUD_DATA_PETUGAS)
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
            OR: [
              {
                nama_petugas: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { username: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [petugas, total] = await Promise.all([
        ctx.prisma.petugas.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            username: true,
            nama_petugas: true,
            createdAt: true,
            _count: {
              select: {
                pembayarans: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        ctx.prisma.petugas.count({ where }),
      ]);

      return {
        petugas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  create: createProtectedProcedure(Permission.CRUD_DATA_PETUGAS)
    .input(
      z.object({
        username: z.string().min(1, "Username harus diisi"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        nama_petugas: z.string().min(1, "Nama petugas harus diisi"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingPetugas = await ctx.prisma.petugas.findUnique({
        where: { username: input.username },
      });

      if (existingPetugas) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username sudah terdaftar",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const petugas = await ctx.prisma.petugas.create({
        data: {
          ...input,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          nama_petugas: true,
          createdAt: true,
        },
      });

      return petugas;
    }),

  update: createProtectedProcedure(Permission.CRUD_DATA_PETUGAS)
    .input(
      z.object({
        id: z.string(),
        username: z.string().min(1, "Username harus diisi").optional(),
        password: z.string().min(6, "Password minimal 6 karakter").optional(),
        nama_petugas: z.string().min(1, "Nama petugas harus diisi").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...data } = input;

      const existingPetugas = await ctx.prisma.petugas.findUnique({
        where: { id },
      });

      if (!existingPetugas) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Petugas tidak ditemukan",
        });
      }

      if (data.username && data.username !== existingPetugas.username) {
        const duplicateUsername = await ctx.prisma.petugas.findUnique({
          where: { username: data.username },
        });

        if (duplicateUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username sudah terdaftar",
          });
        }
      }

      const updateData: any = { ...data };
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const petugas = await ctx.prisma.petugas.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          nama_petugas: true,
          createdAt: true,
        },
      });

      return petugas;
    }),

  delete: createProtectedProcedure(Permission.CRUD_DATA_PETUGAS)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingPetugas = await ctx.prisma.petugas.findUnique({
        where: { id: input.id },
        include: {
          pembayarans: true,
        },
      });

      if (!existingPetugas) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Petugas tidak ditemukan",
        });
      }

      if (existingPetugas.pembayarans.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Tidak dapat menghapus petugas yang memiliki riwayat transaksi",
        });
      }

      await ctx.prisma.petugas.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Petugas berhasil dihapus" };
    }),
});
