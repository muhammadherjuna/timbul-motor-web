const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motors = await prisma.motor.findMany();
  console.log(motors);
  
  if (motors.length > 0) {
    for (const m of motors) {
      await prisma.motor.delete({ where: { id: m.id } });
      console.log("Deleted", m.id);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
