import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, createProtectedProcedure } from "../trpc";
import { Permission } from "../../lib/permissions";

export const sppRouter = router({
  getAll: createProtectedProcedure(Permission.CRUD_DATA_SPP)
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [spp, total] = await Promise.all([
        ctx.prisma.spp.findMany({
          skip,
          take: limit,
          orderBy: { tahun: "desc" },
        }),
        ctx.prisma.spp.count(),
      ]);

      return {
        spp,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  create: createProtectedProcedure(Permission.CRUD_DATA_SPP)
    .input(
      z.object({
        tahun: z.string().min(1, "Tahun harus diisi"),
        nominal: z.number().min(1, "Nominal harus lebih dari 0"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingSpp = await ctx.prisma.spp.findFirst({
        where: { tahun: input.tahun },
      });

      if (existingSpp) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "SPP untuk tahun ini sudah ada",
        });
      }

      const spp = await ctx.prisma.spp.create({
        data: input,
      });

      return spp;
    }),

  update: createProtectedProcedure(Permission.CRUD_DATA_SPP)
    .input(
      z.object({
        id: z.string(),
        tahun: z.string().min(1, "Tahun harus diisi"),
        nominal: z.number().min(1, "Nominal harus lebih dari 0"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingSpp = await ctx.prisma.spp.findUnique({
        where: { id },
      });

      if (!existingSpp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data SPP tidak ditemukan",
        });
      }

      if (data.tahun !== existingSpp.tahun) {
        const duplicateYear = await ctx.prisma.spp.findFirst({
          where: { tahun: data.tahun },
        });

        if (duplicateYear) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "SPP untuk tahun ini sudah ada",
          });
        }
      }

      const spp = await ctx.prisma.spp.update({
        where: { id },
        data,
      });

      return spp;
    }),

  delete: createProtectedProcedure(Permission.CRUD_DATA_SPP)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingSpp = await ctx.prisma.spp.findUnique({
        where: { id: input.id },
      });

      if (!existingSpp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data SPP tidak ditemukan",
        });
      }

      await ctx.prisma.spp.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Data SPP berhasil dihapus" };
    }),
});
