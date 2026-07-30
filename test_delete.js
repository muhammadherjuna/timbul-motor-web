const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const motors = await prisma.motor.findMany();
    if (motors.length > 0) {
      console.log("Deleting motor ID:", motors[0].id);
      await prisma.motor.delete({
        where: { id: motors[0].id }
      });
      console.log("Delete successful!");
    } else {
      console.log("No motors to delete.");
    }
  } catch (e) {
    console.error("Delete failed:", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
