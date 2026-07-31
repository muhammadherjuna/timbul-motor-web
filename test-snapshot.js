const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- VERIFIKASI IMMUTABILITY SNAPSHOT ---')

  const motor = await prisma.motor.findFirst()
  if (!motor) {
    console.log("No motor found to test. Please seed motors first.")
    return
  }
  const pkg = await prisma.inspectionPackage.findFirst({ 
    where: { name: 'Paket Matic Standar' },
    include: { categories: { include: { items: { where: { isActive: true } } } } }
  })

  console.log('Membuat Sesi Inspeksi Baru (Snapshot 1)...')
  const session = await prisma.inspectionSession.create({
    data: {
      motorId: motor.id,
      packageId: pkg.id,
      status: "DRAFT",
      inspectorName: "Admin",
      snapshot: {
        create: pkg.categories.flatMap(cat => 
          cat.items.map(item => ({
            itemKey: item.itemKey,
            question: item.question,
            categoryName: cat.name,
            originalWeight: item.weight,
            isSafetyItem: item.isSafetyItem,
            isCriticalItem: item.isCriticalItem,
            orderIndex: item.orderIndex
          }))
        )
      }
    }
  })

  const category = await prisma.inspectionCategory.findFirst({ 
    where: { packageId: pkg.id, name: 'Mesin & Performa' },
    include: { items: true }
  })
  const item = category.items[0] // Suara Mesin & Klep (Bobot 12%)

  console.log(`Menjawab item: ${item.question} -> NORMAL (100)`)
  await prisma.inspectionItem.create({
    data: {
      sessionId: session.id,
      packageItemId: item.id,
      answer: 'Normal',
      status: 'NORMAL',
      score: 100
    }
  })

  async function completeSession(sessionId) {
    const s = await prisma.inspectionSession.findUnique({
      where: { id: sessionId },
      include: { items: { include: { packageItem: true } }, snapshot: true, package: { include: { categories: true } } }
    });
    let totalScore = 0;
    for (const cat of s.package.categories) {
      const categorySnapshots = s.snapshot.filter(snap => snap.categoryName === cat.name);
      if (categorySnapshots.length === 0) continue;
      const activeItemsWeightSum = categorySnapshots.reduce((sum, snap) => sum + snap.originalWeight, 0);
      let categoryScore = 0;
      for (const snap of categorySnapshots) {
        const normalizedWeight = (snap.originalWeight / activeItemsWeightSum) * 100;
        const answeredItem = s.items.find(i => i.packageItem.itemKey === snap.itemKey);
        const score = answeredItem?.score ?? 0;
        const itemScore = (score * normalizedWeight) / 100;
        categoryScore += itemScore;
      }
      totalScore += (categoryScore * cat.weight) / 100;
    }
    await prisma.inspectionSession.update({ where: { id: sessionId }, data: { totalScore } });
  }

  await completeSession(session.id)
  
  const sessionData1 = await prisma.inspectionSession.findUnique({ where: { id: session.id } })
  console.log(`Skor Awal Sesi: ${sessionData1.totalScore.toFixed(2)}`)

  console.log(`Mengubah bobot item '${item.question}' dari 12 menjadi 50 di tabel induk...`)
  await prisma.inspectionPackageItem.update({
    where: { id: item.id },
    data: { weight: 50 }
  })

  console.log('Menghitung ulang skor sesi lama setelah tabel induk diubah...')
  await completeSession(session.id)
  
  const sessionData2 = await prisma.inspectionSession.findUnique({ where: { id: session.id } })
  console.log(`Skor Sesi Setelah Perubahan Template: ${sessionData2.totalScore.toFixed(2)}`)
  
  if (sessionData1.totalScore.toFixed(2) === sessionData2.totalScore.toFixed(2)) {
    console.log('✅ SUKSES: Immutability terverifikasi! Skor tidak bergeser.')
  } else {
    console.log('❌ GAGAL: Skor bergeser.')
  }

  await prisma.inspectionPackageItem.update({
    where: { id: item.id },
    data: { weight: 12 }
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
