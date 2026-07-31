const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`DELETE FROM "InspectionEvidence"`;
  await prisma.$executeRaw`DELETE FROM "InspectionItem"`;
  await prisma.$executeRaw`DELETE FROM "InspectionSession"`;
  await prisma.$executeRaw`DELETE FROM "InspectionTemplateItem"`;
  await prisma.$executeRaw`DELETE FROM "InspectionTemplateGroup"`;
  await prisma.$executeRaw`DELETE FROM "InspectionTemplate"`;
  console.log('Cleared old inspection tables');
}

main().catch(console.error).finally(() => prisma.$disconnect());
