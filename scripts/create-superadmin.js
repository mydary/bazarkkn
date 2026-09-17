const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = "superadmin";
  const password = "bazar123";
  const name = "Superadmin";

  const existing = await prisma.staffUser.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" sudah ada.`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.staffUser.create({
    data: {
      name,
      username,
      passwordHash: hash,
      role: "SUPERADMIN",
    },
  });

  console.log(`User superadmin berhasil dibuat:`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
