const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Inspection Packages...')

  await prisma.inspectionSessionItemSnapshot.deleteMany({})
  await prisma.inspectionItem.deleteMany({})
  await prisma.inspectionSession.deleteMany({})
  await prisma.inspectionPackageItem.deleteMany({})
  await prisma.inspectionCategory.deleteMany({})
  await prisma.inspectionPackage.deleteMany({})

  // PAKET 1: Matic Standar
  await prisma.inspectionPackage.create({
    data: {
      name: 'Paket Matic Standar',
      description: 'Standar inspeksi khusus untuk motor matic.',
      isDefault: true,
      categories: {
        create: [
          {
            name: 'Mesin & Performa',
            weight: 30,
            orderIndex: 1,
            items: {
              create: [
                { itemKey: 'matic_suara_mesin', question: 'Suara Mesin & Klep', weight: 12, orderIndex: 1 },
                { itemKey: 'matic_tarikan', question: 'Tarikan / Akselerasi', weight: 10, orderIndex: 2 },
                { itemKey: 'matic_knalpot', question: 'Knalpot & Asap', weight: 8, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Sistem Transmisi (CVT)',
            weight: 20,
            orderIndex: 2,
            items: {
              create: [
                { itemKey: 'matic_vbelt', question: 'Kondisi V-Belt & Roller', weight: 10, orderIndex: 1 },
                { itemKey: 'matic_suara_cvt', question: 'Suara CVT (Gredek/Halus)', weight: 10, orderIndex: 2 },
              ]
            }
          },
          {
            name: 'Sistem Rem & Roda',
            weight: 15,
            orderIndex: 3,
            items: {
              create: [
                { itemKey: 'matic_rem', question: 'Fungsi Rem (Depan & Belakang)', weight: 7, isSafetyItem: true, orderIndex: 1 },
                { itemKey: 'matic_ban', question: 'Ketebalan & Kondisi Ban', weight: 5, isSafetyItem: true, orderIndex: 2 },
                { itemKey: 'matic_suspensi', question: 'Suspensi & Velg', weight: 3, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Rangka & Bodi',
            weight: 15,
            orderIndex: 4,
            items: {
              create: [
                { itemKey: 'matic_rangka', question: 'Kelurusan Rangka (Sasis)', weight: 10, isSafetyItem: true, orderIndex: 1 },
                { itemKey: 'matic_bodi', question: 'Kondisi Bodi & Cat', weight: 5, orderIndex: 2 },
              ]
            }
          },
          {
            name: 'Kelistrikan & Lampu',
            weight: 10,
            orderIndex: 5,
            items: {
              create: [
                { itemKey: 'matic_starter', question: 'Fungsi Starter & Aki', weight: 4, orderIndex: 1 },
                { itemKey: 'matic_lampu', question: 'Lampu (Depan, Belakang, Sein)', weight: 4, isSafetyItem: true, orderIndex: 2 },
                { itemKey: 'matic_speedo', question: 'Speedometer & Indikator', weight: 2, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Dokumen & Surat',
            weight: 10,
            orderIndex: 6,
            items: {
              create: [
                { itemKey: 'matic_bpkb', question: 'BPKB & Faktur', weight: 4, isCriticalItem: true, orderIndex: 1 },
                { itemKey: 'matic_stnk', question: 'Status STNK & Pajak', weight: 3, orderIndex: 2 },
                { itemKey: 'matic_nosin', question: 'Kecocokan No. Rangka & Mesin', weight: 2, isCriticalItem: true, orderIndex: 3 },
                { itemKey: 'matic_kunci', question: 'Kunci Cadangan', weight: 1, orderIndex: 4 },
              ]
            }
          }
        ]
      }
    }
  })

  // PAKET 2: Sport & Bebek (Manual)
  await prisma.inspectionPackage.create({
    data: {
      name: 'Paket Sport & Bebek (Manual)',
      description: 'Standar inspeksi khusus untuk motor dengan transmisi manual / kopling.',
      isDefault: false,
      categories: {
        create: [
          {
            name: 'Mesin & Performa',
            weight: 30,
            orderIndex: 1,
            items: {
              create: [
                { itemKey: 'manual_suara_mesin', question: 'Suara Mesin & Klep', weight: 10, orderIndex: 1 },
                { itemKey: 'manual_tarikan', question: 'Tarikan / Akselerasi', weight: 8, orderIndex: 2 },
                { itemKey: 'manual_radiator', question: 'Radiator & Sistem Pendingin', weight: 6, orderIndex: 3 },
                { itemKey: 'manual_knalpot', question: 'Knalpot & Asap', weight: 6, orderIndex: 4 },
              ]
            }
          },
          {
            name: 'Transmisi & Kopling',
            weight: 20,
            orderIndex: 2,
            items: {
              create: [
                { itemKey: 'manual_gigi', question: 'Perpindahan Gigi', weight: 8, orderIndex: 1 },
                { itemKey: 'manual_kopling', question: 'Kondisi Kopling (Otomatis/Manual)', weight: 6, orderIndex: 2 },
                { itemKey: 'manual_rantai', question: 'Rantai & Gear Set', weight: 6, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Sistem Rem & Roda',
            weight: 15,
            orderIndex: 3,
            items: {
              create: [
                { itemKey: 'manual_rem', question: 'Fungsi Rem (Depan & Belakang)', weight: 7, isSafetyItem: true, orderIndex: 1 },
                { itemKey: 'manual_ban', question: 'Ketebalan & Kondisi Ban', weight: 5, isSafetyItem: true, orderIndex: 2 },
                { itemKey: 'manual_suspensi', question: 'Suspensi & Velg', weight: 3, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Rangka & Bodi',
            weight: 15,
            orderIndex: 4,
            items: {
              create: [
                { itemKey: 'manual_rangka', question: 'Kelurusan Rangka (Sasis)', weight: 10, isSafetyItem: true, orderIndex: 1 },
                { itemKey: 'manual_bodi', question: 'Kondisi Bodi & Tangki', weight: 5, orderIndex: 2 },
              ]
            }
          },
          {
            name: 'Kelistrikan & Lampu',
            weight: 10,
            orderIndex: 5,
            items: {
              create: [
                { itemKey: 'manual_starter', question: 'Fungsi Starter & Aki', weight: 4, orderIndex: 1 },
                { itemKey: 'manual_lampu', question: 'Lampu (Depan, Belakang, Sein)', weight: 4, isSafetyItem: true, orderIndex: 2 },
                { itemKey: 'manual_speedo', question: 'Speedometer & Indikator', weight: 2, orderIndex: 3 },
              ]
            }
          },
          {
            name: 'Dokumen & Surat',
            weight: 10,
            orderIndex: 6,
            items: {
              create: [
                { itemKey: 'manual_bpkb', question: 'BPKB & Faktur', weight: 4, isCriticalItem: true, orderIndex: 1 },
                { itemKey: 'manual_stnk', question: 'Status STNK & Pajak', weight: 3, orderIndex: 2 },
                { itemKey: 'manual_nosin', question: 'Kecocokan No. Rangka & Mesin', weight: 2, isCriticalItem: true, orderIndex: 3 },
                { itemKey: 'manual_kunci', question: 'Kunci Cadangan', weight: 1, orderIndex: 4 },
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seeding Packages Complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
