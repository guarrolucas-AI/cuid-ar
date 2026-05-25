import 'dotenv/config'
import { prisma } from '../lib/prisma.js'

const users = await prisma.user.findMany({
  select: { email: true, role: true, status: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: 10
})

console.log('STATUS       ROL          EMAIL')
console.log('─'.repeat(60))
users.forEach(u => console.log(u.status.padEnd(12), u.role.padEnd(12), u.email))

await prisma.$disconnect()
