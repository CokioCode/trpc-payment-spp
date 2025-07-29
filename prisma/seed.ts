import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const kelas = await Promise.all([
    prisma.kelas.upsert({
      where: { nama_kelas: "X-IPA-1" },
      update: {},
      create: { nama_kelas: "X-IPA-1" },
    }),
    prisma.kelas.upsert({
      where: { nama_kelas: "X-IPA-2" },
      update: {},
      create: { nama_kelas: "X-IPA-2" },
    }),
    prisma.kelas.upsert({
      where: { nama_kelas: "XI-IPA-1" },
      update: {},
      create: { nama_kelas: "XI-IPA-1" },
    }),
  ]);

  const siswa1 = await prisma.siswa.upsert({
    where: { nis: "2024001" },
    update: {},
    create: {
      nis: "2024001",
      nama: "Ahmad Fauzi",
      alamat: "Jl. Merdeka No. 123",
      id_kelas: kelas[0].id,
      no_telp: "081234567890",
    },
  });

  const siswa2 = await prisma.siswa.upsert({
    where: { nis: "2024002" },
    update: {},
    create: {
      nis: "2024002",
      nama: "Siti Nurhaliza",
      alamat: "Jl. Sudirman No. 456",
      id_kelas: kelas[1].id,
      no_telp: "081234567891",
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      password: hashedPassword,
      nama: "Administrator",
      role: "ADMINISTRATOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "petugas@school.com" },
    update: {},
    create: {
      email: "petugas@school.com",
      password: await bcrypt.hash("petugas123", 12),
      nama: "Petugas SPP",
      role: "PETUGAS",
    },
  });

  await prisma.user.upsert({
    where: { email: "siswa1@school.com" },
    update: {},
    create: {
      email: "siswa1@school.com",
      password: await bcrypt.hash("siswa123", 12),
      nama: "Ahmad Fauzi",
      role: "SISWA",
      siswaId: siswa1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "siswa2@school.com" },
    update: {},
    create: {
      email: "siswa2@school.com",
      password: await bcrypt.hash("siswa123", 12),
      nama: "Siti Nurhaliza",
      role: "SISWA",
      siswaId: siswa2.id,
    },
  });

  await prisma.petugas.upsert({
    where: { username: "petugas1" },
    update: {},
    create: {
      username: "petugas1",
      password: await bcrypt.hash("petugas123", 12),
      nama_petugas: "Budi Santoso",
    },
  });

  await prisma.spp.upsert({
    where: { tahun: "2024" },
    update: {},
    create: {
      tahun: "2024",
      nominal: 500000,
    },
  });

  console.log("Seeding completed!");
  console.log("Login credentials:");
  console.log("Admin: admin@school.com / admin123");
  console.log("Petugas: petugas@school.com / petugas123");
  console.log("Siswa 1: siswa1@school.com / siswa123");
  console.log("Siswa 2: siswa2@school.com / siswa123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
