import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

const EMAIL    = 'vaninachristiansen@gmail.com'
const NEW_PASS = 'temporal26'

const hashed = await bcrypt.hash(NEW_PASS, 10)

const user = await prisma.user.upsert({
  where: { email: EMAIL },
  update: { password: hashed, role: 'admin' },
  create: { email: EMAIL, password: hashed, role: 'admin' },
})

console.log('✅ Admin listo:', user.email, '| role:', user.role, '| status:', user.status)
await prisma.$disconnect()
