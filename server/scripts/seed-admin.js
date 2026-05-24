import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL    = process.argv[2]
const PASSWORD = process.argv[3]

if (!EMAIL || !PASSWORD) {
  console.error('Uso: node scripts/seed-admin.js <email> <password>')
  process.exit(1)
}

const existing = await prisma.user.findUnique({ where: { email: EMAIL } })
if (existing) {
  // Si ya existe, solo actualiza el rol a admin
  await prisma.user.update({ where: { email: EMAIL }, data: { role: 'admin' } })
  console.log(`✅ Usuario existente actualizado a admin: ${EMAIL}`)
} else {
  const hashed = await bcrypt.hash(PASSWORD, 10)
  await prisma.user.create({ data: { email: EMAIL, password: hashed, role: 'admin' } })
  console.log(`✅ Admin creado: ${EMAIL}`)
}

await prisma.$disconnect()
