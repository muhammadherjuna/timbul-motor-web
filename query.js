const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.inspectionSession.findMany({
  select: { id: true, status: true, motorId: true, completedAt: true }
}).then(s => console.log(s)).finally(() => prisma.$disconnect());
