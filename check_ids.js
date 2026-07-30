const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motor = await prisma.motor.findUnique({
    where: { id: '49f0f972-a42e-4533-9125-de9b58c81f58' },
    include: { pricing: true, document: true, history: true, inspection: true }
  });
  console.log("Motor ID:", motor.id);
  console.log("Pricing ID:", motor.pricing?.id);
  console.log("Document ID:", motor.document?.id);
  console.log("History ID:", motor.history?.id);
  console.log("Inspection ID:", motor.inspection?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
