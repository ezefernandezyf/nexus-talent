import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert default settings
  await prisma.settings.upsert({
    where: { id: "app-settings" },
    create: { id: "app-settings", config: {} },
    update: {},
  });
  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
