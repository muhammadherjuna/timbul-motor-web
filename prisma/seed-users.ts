import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial users...')

  const users = [
    {
      name: 'Super Admin',
      email: 'admin@timbulmotor.com',
      passwordStr: 'admin123',
      role: 'ADMIN',
    },
    {
      name: 'Kepala Showroom',
      email: 'supervisor@timbulmotor.com',
      passwordStr: 'super123',
      role: 'SUPERVISOR',
    },
    {
      name: 'Tim Mekanik',
      email: 'mekanik@timbulmotor.com',
      passwordStr: 'mekanik123',
      role: 'MECHANIC',
    },
  ]

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.passwordStr, 10)
    
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        role: u.role,
        name: u.name,
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role,
      },
    })
    console.log(`Upserted user: ${u.email} (${u.role})`)
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
