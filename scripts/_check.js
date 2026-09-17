const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  // Check products and their category assignments
  const products = await prisma.product.findMany({
    select: { name: true, categoryId: true, kelompokId: true, isAvailable: true },
  });
  console.log(`Total produk di DB: ${products.length}`);
  
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, kelompokId: true },
  });
  
  // Check if product.categoryId matches a category in the same kelompok
  let mismatch = 0;
  for (const p of products) {
    const match = categories.find(c => c.id === p.categoryId && c.kelompokId === p.kelompokId);
    if (!match) {
      console.log(`MISMATCH: ${p.name} (kelompokId=${p.kelompokId}, categoryId=${p.categoryId})`);
      mismatch++;
    }
  }
  console.log(`Mismatch: ${mismatch}`);
  
  // Now check what the pasar query returns
  const kelompokList = await prisma.kelompok.findMany({
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { products: { where: { isAvailable: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
  
  let totalFromQuery = 0;
  for (const k of kelompokList) {
    for (const c of k.categories) {
      totalFromQuery += c.products.length;
      if (c.products.length > 0) {
        console.log(`${k.name} | ${c.name} : ${c.products.length} produk`);
      }
    }
  }
  console.log(`Total dari query pasar: ${totalFromQuery}`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
