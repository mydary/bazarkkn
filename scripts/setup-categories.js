/**
 * Pastikan semua kelompok punya 6 kategori default.
 * Tambahkan yang belum ada, skip yang sudah ada.
 * Pakai: node scripts/setup-categories.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = ["Makanan", "Minuman", "Aksesoris", "Hiasan", "Craft", "Souvenir"];

async function main() {
  const kelompokList = await prisma.kelompok.findMany();
  for (const k of kelompokList) {
    const existing = await prisma.category.findMany({ where: { kelompokId: k.id } });
    const existingNames = existing.map((c) => c.name);
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      if (!existingNames.includes(DEFAULT_CATEGORIES[i])) {
        await prisma.category.create({
          data: { kelompokId: k.id, name: DEFAULT_CATEGORIES[i], sortOrder: i },
        });
        console.log(`  [${k.name}] Tambah: ${DEFAULT_CATEGORIES[i]}`);
      }
    }
    console.log(`[${k.name}] ${existingNames.length}/6 kategori.`);
  }
  console.log("\nSelesai.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
