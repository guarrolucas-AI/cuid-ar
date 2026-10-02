import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

// Uso: EMAIL=admin@ejemplo.com NEW_PASS=tupass node server/scripts/reset-admin.js
const EMAIL    = process.env.EMAIL
const NEW_PASS = process.env.NEW_PASS

if (!EMAIL || !NEW_PASS) {
  console.error('Uso: EMAIL=<email> NEW_PASS=<password> node server/scripts/reset-admin.js')
  process.exit(1)
}

const hashed = await bcrypt.hash(NEW_PASS, 10)

const user = await prisma.user.upsert({
  where:  { email: EMAIL.toLowerCase().trim() },
  update: { password: hashed, role: 'admin' },
  create: { email: EMAIL.toLowerCase().trim(), password: hashed, role: 'admin' },
})

console.log('✅ Admin listo:', user.email, '| role:', user.role, '| status:', user.status)
await prisma.$disconnect()
