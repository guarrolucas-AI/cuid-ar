import 'dotenv/config'
import { prisma } from '../lib/prisma.js'

const EMAIL = process.argv[2]
if (!EMAIL) { console.log('Uso: node scripts/activate-user.js <email>'); process.exit(1) }

const user = await prisma.user.update({
  where: { email: EMAIL },
  data: { status: 'subscribed' },
})
console.log('✅ Activado:', user.email, '| status:', user.status)
await prisma.$disconnect()
