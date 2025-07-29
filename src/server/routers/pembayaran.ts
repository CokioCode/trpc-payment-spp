import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, createProtectedProcedure } from "../trpc";
import { Permission } from "../../lib/permissions";

export const pembayaranRouter = router({
  create: createProtectedProcedure(Permission.ENTRI_TRANSAKSI_PEMBAYARAN)
    .input(
      z.object({
        id_siswa: z.string().min(1, "Siswa harus dipilih"),
        bulan_bayar: z.string().min(1, "Bulan bayar harus diisi"),
        tahun_bayar: z.string().min(1, "Tahun bayar harus diisi"),
        jumlah_bayar: z.number().min(1, "Jumlah bayar harus lebih dari 0"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const siswa = await ctx.prisma.siswa.findUnique({
        where: { id: input.id_siswa },
      });

      if (!siswa) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Siswa tidak ditemukan",
        });
      }

      const existingPayment = await ctx.prisma.pembayaran.findFirst({
        where: {
          id_siswa: input.id_siswa,
          bulan_bayar: input.bulan_bayar,
          tahun_bayar: input.tahun_bayar,
        },
      });

      if (existingPayment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Pembayaran untuk bulan dan tahun ini sudah ada",
        });
      }

      let petugasId = "";

      if (ctx.user.role === "ADMINISTRATOR") {
        let adminPetugas = await ctx.prisma.petugas.findFirst({
          where: { username: ctx.user.nama },
        });

        if (!adminPetugas) {
          adminPetugas = await ctx.prisma.petugas.create({
            data: {
              username: ctx.user.email,
              password: "default_admin_password",
              nama_petugas: ctx.user.nama,
            },
          });
        }
        petugasId = adminPetugas.id;
      } else if (ctx.user.role === "PETUGAS") {
        const petugas = await ctx.prisma.petugas.findFirst({
          where: { username: ctx.user.nama },
        });

        if (!petugas) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Data petugas tidak ditemukan",
          });
        }
        petugasId = petugas.id;
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Hanya administrator dan petugas yang dapat membuat pembayaran",
        });
      }

      const pembayaran = await ctx.prisma.pembayaran.create({
        data: {
          ...input,
          id_petugas: petugasId,
        },
        include: {
          siswa: {
            include: {
              kelas: true,
            },
          },
          petugas: true,
        },
      });

      return pembayaran;
    }),

  getHistory: createProtectedProcedure(Permission.LIHAT_HISTORY_PEMBAYARAN)
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        siswaId: z.string().optional(),
        bulan: z.string().optional(),
        tahun: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, siswaId, bulan, tahun } = input;
      const skip = (page - 1) * limit;

      let where: any = {};

      if (ctx.user.role === "SISWA") {
        if (!ctx.user.siswaId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student data not found",
          });
        }
        where.id_siswa = ctx.user.siswaId;
      } else {
        if (siswaId) where.id_siswa = siswaId;
      }

      if (bulan) where.bulan_bayar = bulan;
      if (tahun) where.tahun_bayar = tahun;

      const [pembayaran, total] = await Promise.all([
        ctx.prisma.pembayaran.findMany({
          where,
          skip,
          take: limit,
          include: {
            siswa: {
              include: {
                kelas: true,
              },
            },
            petugas: true,
          },
          orderBy: { tgl_bayar: "desc" },
        }),
        ctx.prisma.pembayaran.count({ where }),
      ]);

      return {
        pembayaran,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  generateLaporan: createProtectedProcedure(Permission.GENERATE_LAPORAN)
    .input(
      z.object({
        tahun: z.string(),
        bulan: z.string().optional(),
        kelasId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { tahun, bulan, kelasId } = input;

      let where: any = { tahun_bayar: tahun };
      if (bulan) where.bulan_bayar = bulan;
      if (kelasId) {
        where.siswa = {
          id_kelas: kelasId,
        };
      }

      const pembayaran = await ctx.prisma.pembayaran.findMany({
        where,
        include: {
          siswa: {
            include: {
              kelas: true,
            },
          },
          petugas: true,
        },
        orderBy: [
          { siswa: { kelas: { nama_kelas: "asc" } } },
          { siswa: { nama: "asc" } },
          { bulan_bayar: "asc" },
        ],
      });

      const totalPembayaran = pembayaran.reduce(
        (sum, p) => sum + p.jumlah_bayar,
        0
      );
      const totalTransaksi = pembayaran.length;

      const summaryByKelas = pembayaran.reduce((acc, p) => {
        const kelasName = p.siswa.kelas?.nama_kelas || "Tanpa Kelas";
        if (!acc[kelasName]) {
          acc[kelasName] = { count: 0, total: 0 };
        }
        acc[kelasName].count++;
        acc[kelasName].total += p.jumlah_bayar;
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      return {
        pembayaran,
        summary: {
          totalPembayaran,
          totalTransaksi,
          summaryByKelas,
        },
      };
    }),
});
