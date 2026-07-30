const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motor = await prisma.motor.findUnique({
    where: { id: '4a856c33-2485-4c32-b5e5-685970aa245d' }
  });
  console.log(motor);
}
main().catch(console.error).finally(() => prisma.$disconnect());
