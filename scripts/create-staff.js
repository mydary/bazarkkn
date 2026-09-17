/**
 * Buat akun panitia untuk satu kelompok.
 * Pakai: node scripts/create-staff.js <kelompokId> <name> <username> <password>
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const [kelompokId, name, username, password] = process.argv.slice(2);
  if (!kelompokId || !name || !username || !password) {
    console.error("Pakai: node create-staff.js <kelompokId> <name> <username> <password>");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const staff = await prisma.staffUser.create({
    data: { kelompokId, name, username, passwordHash },
  });
  console.log(`Panitia dibuat: ${staff.username} untuk kelompok ${kelompokId}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
