import { router } from "../trpc";
import { authRouter } from "./auth";
import { siswaRouter } from "./siswa";
import { kelasRouter } from "./kelas";
import { petugasRouter } from "./petugas";
import { sppRouter } from "./spp";
import { pembayaranRouter } from "./pembayaran";

export const appRouter = router({
  auth: authRouter,
  siswa: siswaRouter,
  kelas: kelasRouter,
  petugas: petugasRouter,
  spp: sppRouter,
  pembayaran: pembayaranRouter,
});

export type AppRouter = typeof appRouter;
