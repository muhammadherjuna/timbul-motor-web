const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motor = await prisma.motor.findUnique({
    where: { id: "c1b4f26d-c14d-43be-a39f-831d26d8e684" }
  });
  console.log(motor);
  
  const allMotors = await prisma.motor.findMany({ select: { id: true, code: true } });
  console.log("All motors:", allMotors);
}

main().catch(console.error).finally(() => prisma.$disconnect());
