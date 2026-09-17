/**
 * Buat kelompok baru + kategori default (dijalankan sekali per kelompok, 7x untuk bazar ini).
 * Pakai: node scripts/create-kelompok.js <name> <slug> [kategori1,kategori2,...]
 * Contoh: node scripts/create-kelompok.js "Kelompok 19 - Beberan" kelompok-19
 * Jika kategori tidak disertakan, pakai default: Makanan, Minuman, Aksesoris, Hiasan, Craft, Souvenir
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = ["Makanan", "Minuman", "Aksesoris", "Hiasan", "Craft", "Souvenir"];

async function main() {
  const [name, slug, catsArg] = process.argv.slice(2);
  if (!name || !slug) {
    console.error("Pakai: node create-kelompok.js <name> <slug> [kategori1,kategori2,...]");
    process.exit(1);
  }
  const kelompok = await prisma.kelompok.create({ data: { name, slug } });
  console.log(`Kelompok dibuat: ${kelompok.name} (id: ${kelompok.id})`);

  const categories = catsArg ? catsArg.split(",").map((c) => c.trim()) : DEFAULT_CATEGORIES;

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.create({
      data: { kelompokId: kelompok.id, name: categories[i], sortOrder: i },
    });
    console.log(`  Kategori dibuat: ${categories[i]}`);
  }

  console.log("Selanjutnya buat akun panitia untuk kelompok ini dengan create-staff.js");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
