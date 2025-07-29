import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, createProtectedProcedure } from "../trpc";
import { Permission } from "../../lib/permissions";

export const siswaRouter = router({
  getAll: createProtectedProcedure(Permission.CRUD_DATA_SISWA)
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
              { nama: { contains: search, mode: "insensitive" as const } },
              { nis: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [siswa, total] = await Promise.all([
        ctx.prisma.siswa.findMany({
          where,
          skip,
          take: limit,
          include: {
            kelas: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        ctx.prisma.siswa.count({ where }),
      ]);

      return {
        siswa,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getById: createProtectedProcedure(Permission.CRUD_DATA_SISWA)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const siswa = await ctx.prisma.siswa.findUnique({
        where: { id: input.id },
        include: {
          kelas: true,
          pembayarans: {
            include: {
              petugas: true,
            },
            orderBy: { tgl_bayar: "desc" },
          },
        },
      });

      if (!siswa) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Siswa tidak ditemukan",
        });
      }

      return siswa;
    }),

  // Siswa can view their own data
  getMyData: createProtectedProcedure(Permission.LOGIN).query(
    async ({ ctx }) => {
      if (ctx.user.role !== "SISWA") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only students can access this endpoint",
        });
      }

      if (!ctx.user.siswaId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student data not found",
        });
      }

      const siswa = await ctx.prisma.siswa.findUnique({
        where: { id: ctx.user.siswaId },
        include: {
          kelas: true,
          pembayarans: {
            include: {
              petugas: true,
            },
            orderBy: { tgl_bayar: "desc" },
          },
        },
      });

      return siswa;
    }
  ),

  create: createProtectedProcedure(Permission.CRUD_DATA_SISWA)
    .input(
      z.object({
        nis: z.string().min(1, "NIS harus diisi"),
        nama: z.string().min(1, "Nama harus diisi"),
        alamat: z.string().optional(),
        id_kelas: z.string().optional(),
        no_telp: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingSiswa = await ctx.prisma.siswa.findUnique({
        where: { nis: input.nis },
      });

      if (existingSiswa) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "NIS sudah terdaftar",
        });
      }

      if (input.id_kelas) {
        const kelas = await ctx.prisma.kelas.findUnique({
          where: { id: input.id_kelas },
        });

        if (!kelas) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kelas tidak ditemukan",
          });
        }
      }

      const siswa = await ctx.prisma.siswa.create({
        data: input,
        include: {
          kelas: true,
        },
      });

      return siswa;
    }),

  update: createProtectedProcedure(Permission.CRUD_DATA_SISWA)
    .input(
      z.object({
        id: z.string(),
        nis: z.string().min(1, "NIS harus diisi").optional(),
        nama: z.string().min(1, "Nama harus diisi").optional(),
        alamat: z.string().optional(),
        id_kelas: z.string().optional(),
        no_telp: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingSiswa = await ctx.prisma.siswa.findUnique({
        where: { id },
      });

      if (!existingSiswa) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Siswa tidak ditemukan",
        });
      }

      if (data.nis && data.nis !== existingSiswa.nis) {
        const duplicateNis = await ctx.prisma.siswa.findUnique({
          where: { nis: data.nis },
        });

        if (duplicateNis) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "NIS sudah terdaftar",
          });
        }
      }

      if (data.id_kelas) {
        const kelas = await ctx.prisma.kelas.findUnique({
          where: { id: data.id_kelas },
        });

        if (!kelas) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kelas tidak ditemukan",
          });
        }
      }

      const siswa = await ctx.prisma.siswa.update({
        where: { id },
        data,
        include: {
          kelas: true,
        },
      });

      return siswa;
    }),

  delete: createProtectedProcedure(Permission.CRUD_DATA_SISWA)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingSiswa = await ctx.prisma.siswa.findUnique({
        where: { id: input.id },
        include: {
          pembayarans: true,
          users: true,
        },
      });

      if (!existingSiswa) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Siswa tidak ditemukan",
        });
      }

      if (existingSiswa.pembayarans.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Tidak dapat menghapus siswa yang memiliki riwayat pembayaran",
        });
      }

      if (existingSiswa.users.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tidak dapat menghapus siswa yang memiliki akun user",
        });
      }

      await ctx.prisma.siswa.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Siswa berhasil dihapus" };
    }),
});
