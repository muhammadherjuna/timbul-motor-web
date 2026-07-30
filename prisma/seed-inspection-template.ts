const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Inspection Template...')
  
  // Clean up old templates if needed (uncomment for reset)
  // await prisma.inspectionTemplate.deleteMany({})

  const template = await prisma.inspectionTemplate.create({
    data: {
      name: 'Standar Inspeksi Timbul Motor 2026',
      version: '1.0.0',
      motorTypeFilter: 'all',
      isActive: true,
      groups: {
        create: [
          {
            name: 'Mesin & Performa',
            weight: 25,
            orderIndex: 1,
            items: {
              create: [
                {
                  itemKey: 'engine_start',
                  question: 'Kondisi mesin saat distart (Dingin & Panas)',
                  applicableFor: 'all',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Hidup normal, responsif, stasioner stabil', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Hidup tapi stasioner agak naik turun / getar', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Susah distarter, perlu gas ditahan / beberapa kali kick', status: 'PERBAIKAN', isCritical: false, score: 40 },
                    { text: 'Mati / tidak bisa dihidupkan sama sekali', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                },
                {
                  itemKey: 'engine_sound',
                  question: 'Suara Mesin',
                  applicableFor: 'all',
                  orderIndex: 2,
                  possibleAnswers: [
                    { text: 'Halus, normal sesuai standar pabrik', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Ada sedikit suara kasar di RPM tertentu', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Suara kasar / ngelitik / kletek-kletek', status: 'PERBAIKAN', isCritical: false, score: 40 },
                    { text: 'Suara sangat kasar seperti piston/stang seher aus', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                }
              ]
            }
          },
          {
            name: 'Sistem Transmisi (Matic / CVT)',
            weight: 10,
            orderIndex: 2,
            items: {
              create: [
                {
                  itemKey: 'cvt_sound',
                  question: 'Suara Area CVT (Khusus Matic)',
                  applicableFor: 'matic',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Halus, tidak ada suara gredek / mendecit', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Gredek ringan saat tarikan awal', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Suara mendecit kencang / gredek parah', status: 'PERBAIKAN', isCritical: false, score: 40 },
                    { text: 'Tidak Berlaku (Bukan Matic)', status: 'TIDAK_BERLAKU', isCritical: false, score: null }
                  ]
                }
              ]
            }
          },
          {
            name: 'Sistem Transmisi (Manual / Kopling)',
            weight: 10,
            orderIndex: 3,
            items: {
              create: [
                {
                  itemKey: 'gear_shift',
                  question: 'Perpindahan Gigi & Kopling (Manual/Sport)',
                  applicableFor: 'manual',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Halus, persneling presisi, kopling tidak selip', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Kopling agak keras / gigi agak keras', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Kopling selip / gigi susah masuk atau sering loncat', status: 'PERBAIKAN', isCritical: false, score: 40 },
                    { text: 'Transmisi jebol / tidak bisa oper gigi', status: 'KRITIS', isCritical: true, score: 0 },
                    { text: 'Tidak Berlaku (Matic)', status: 'TIDAK_BERLAKU', isCritical: false, score: null }
                  ]
                }
              ]
            }
          },
          {
            name: 'Sistem Rem & Roda',
            weight: 15,
            orderIndex: 4,
            items: {
              create: [
                {
                  itemKey: 'brake_front',
                  question: 'Fungsi Rem Depan',
                  applicableFor: 'all',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Pakem, handel rem normal, tidak bocor', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Agak dalam / kampas mulai tipis', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Rem blong / master rem bocor / macet', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                },
                {
                  itemKey: 'brake_rear',
                  question: 'Fungsi Rem Belakang',
                  applicableFor: 'all',
                  orderIndex: 2,
                  possibleAnswers: [
                    { text: 'Pakem, handel/pedal normal, tidak bocor', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Agak dalam / kampas mulai tipis', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Rem blong / master rem bocor / macet', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                }
              ]
            }
          },
          {
            name: 'Rangka & Bodi',
            weight: 20,
            orderIndex: 5,
            items: {
              create: [
                {
                  itemKey: 'chassis_condition',
                  question: 'Kondisi Rangka / Sasis',
                  applicableFor: 'all',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Lurus, center, tidak ada karat keropos', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Ada karat permukaan (wajar pemakaian)', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Keropos tembus / bengkok (bekas tabrak)', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                },
                {
                  itemKey: 'body_paint',
                  question: 'Kondisi Bodi & Cat',
                  applicableFor: 'all',
                  orderIndex: 2,
                  possibleAnswers: [
                    { text: 'Mulus, original, klip utuh', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Lecet pemakaian / baret halus', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Pecah / dudukan baut patah / cat kusam parah', status: 'PERBAIKAN', isCritical: false, score: 40 }
                  ]
                }
              ]
            }
          },
          {
            name: 'Kelistrikan & Lampu',
            weight: 15,
            orderIndex: 6,
            items: {
              create: [
                {
                  itemKey: 'electrical_lights',
                  question: 'Sistem Penerangan & Klakson',
                  applicableFor: 'all',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Semua lampu & klakson hidup normal', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Ada 1-2 lampu mati (misal sein/senja)', status: 'PERBAIKAN', isCritical: false, score: 40 },
                    { text: 'Mati total / kiprok jebol / klakson mati total', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                },
                {
                  itemKey: 'speedometer',
                  question: 'Fungsi Speedometer & Indikator',
                  applicableFor: 'all',
                  orderIndex: 2,
                  possibleAnswers: [
                    { text: 'Normal, ODO jalan, indikator bensin akurat', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Lampu backlight mati / kaca retak rambut', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Mati total / kabel putus / indikator bensin error', status: 'PERBAIKAN', isCritical: false, score: 40 }
                  ]
                }
              ]
            }
          },
          {
            name: 'Uji Jalan (Test Drive)',
            weight: 15,
            orderIndex: 7,
            items: {
              create: [
                {
                  itemKey: 'test_drive_feel',
                  question: 'Handling & Kestabilan (Test Jalan)',
                  applicableFor: 'all',
                  orderIndex: 1,
                  possibleAnswers: [
                    { text: 'Stabil, lepas tangan tidak lari, handling mantap', status: 'NORMAL', isCritical: false, score: 100 },
                    { text: 'Ada sedikit limbung / komstir agak kencang', status: 'CATATAN', isCritical: false, score: 75 },
                    { text: 'Lari ke kiri/kanan parah, tidak aman dikendarai', status: 'KRITIS', isCritical: true, score: 0 }
                  ]
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Template created with ID:', template.id)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
