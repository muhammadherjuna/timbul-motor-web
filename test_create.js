const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const motor = await prisma.motor.create({
      data: {
        code: "TEST-123",
        brand: "Honda",
        name: "Test Motor",
        type: "matic",
        year: 2022,
        color: "Hitam",
        cc: 150,
        transmission: "Automatic",
        km: 1000,
        image: "https://example.com/img.jpg",
        images: ["https://example.com/img.jpg"],
        description: "-",
        status: "Tersedia",
        
        document: { create: {
          tax_status: "Hidup",
          tax_expiry: "2024-01-01"
        }},
        history: { create: {}},
        inspection: { create: {}},
        pricing: { create: {
          price: 10000,
          dp_min: 1000
        }}
      }
    });
    console.log("Create successful:", motor.id);
  } catch (e) {
    console.error("Create failed:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
