const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- SIMULASI PERHITUNGAN SKOR INSPEKSI END-TO-END ---')

  // 1. Ambil Paket Matic Standar (Default)
  const package = await prisma.inspectionPackage.findFirst({
    where: { name: 'Paket Matic Standar' },
    include: {
      categories: {
        include: { items: true },
        orderBy: { orderIndex: 'asc' }
      }
    }
  })

  console.log(`Menggunakan Paket: ${package.name}`)
  
  // Simulasi: Mekanik menonaktifkan item 'Knalpot & Asap' (weight 8) dari kategori 'Mesin & Performa'
  // Dan mekanik menjawab item lainnya.

  let totalSkorAkhir = 0
  let isLimiterActive = false

  for (const category of package.categories) {
    let categoryScore = 0
    let activeItemsWeightSum = 0

    // Kita asumsikan semua item aktif KECUALI 'matic_knalpot'
    const activeItems = category.items.filter(i => i.itemKey !== 'matic_knalpot')

    // Hitung total original weight dari item yang aktif di kategori ini
    activeItems.forEach(i => {
      activeItemsWeightSum += i.weight
    })

    console.log(`\nKategori: ${category.name} (Bobot Asli Kategori: ${category.weight}%)`)
    console.log(`Total bobot item aktif (sebelum normalisasi): ${activeItemsWeightSum}`)

    activeItems.forEach(item => {
      // Normalisasi proporsional
      const normalizedWeight = (item.weight / activeItemsWeightSum) * 100
      
      // Simulasi Jawaban
      let status = 'NORMAL'
      let score = 100
      
      if (item.itemKey === 'matic_rem') {
        // Kasus: Rem Rusak (Item Keselamatan)
        status = 'RUSAK'
        score = 0
        if (item.isSafetyItem || item.isCriticalItem) {
          isLimiterActive = true
          console.log(`\n⚠️ LIMITER KESELAMATAN AKTIF! Item '${item.question}' dinilai RUSAK.`)
        }
      } else if (item.itemKey === 'matic_bodi') {
        status = 'PERLU_PERBAIKAN'
        score = 50
      }

      // Skor per item
      const itemScore = (score * normalizedWeight) / 100
      categoryScore += itemScore

      console.log(`- ${item.question}: Jawaban=${status} | Bobot Asli=${item.weight}% -> Normalisasi=${normalizedWeight.toFixed(2)}% | Skor Didapat=${itemScore.toFixed(2)}`)
    })

    const categoryFinalScore = (categoryScore * category.weight) / 100
    totalSkorAkhir += categoryFinalScore

    console.log(`>> Skor Kategori (Skala 100): ${categoryScore.toFixed(2)}`)
    console.log(`>> Kontribusi ke Skor Akhir: ${categoryFinalScore.toFixed(2)} / ${category.weight}%`)
  }

  console.log('\n=======================================')
  console.log(`TOTAL SKOR AKHIR: ${totalSkorAkhir.toFixed(2)}`)
  
  // Penentuan Grade
  let grade = 'D'
  if (totalSkorAkhir >= 90) grade = 'A'
  else if (totalSkorAkhir >= 75) grade = 'B'
  else if (totalSkorAkhir >= 60) grade = 'C'

  console.log(`GRADE ASLI (Berdasarkan Skor): ${grade}`)

  if (isLimiterActive && (grade === 'A' || grade === 'B')) {
    grade = 'C'
    console.log(`GRADE SETELAH LIMITER: ${grade} (Diturunkan karena isu keselamatan/kritikal)`)
  }

  console.log('=======================================')
}

main().catch(console.error).finally(() => prisma.$disconnect())
