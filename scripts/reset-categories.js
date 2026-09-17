const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.orderGroup.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const kelompokList = await prisma.kelompok.findMany();
  const cats = ["Makanan", "Minuman", "Aksesoris", "Hiasan", "Craft", "Souvenir"];
  for (const k of kelompokList) {
    for (let i = 0; i < cats.length; i++) {
      await prisma.category.create({
        data: { kelompokId: k.id, name: cats[i], sortOrder: i },
      });
    }
    console.log(`[${k.name}] 6 kategori disetel.`);
  }
  console.log("\nSemua selesai.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
