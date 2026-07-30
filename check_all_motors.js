const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motors = await prisma.motor.findMany();
  console.log(motors);
}
main().catch(console.error).finally(() => prisma.$disconnect());
