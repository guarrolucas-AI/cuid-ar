import { prisma } from '../lib/prisma.js'

const email = 'lucasg_86@hotmail.com'
const user = await prisma.user.findUnique({ where: { email } })
if (!user) { console.log('Usuario no encontrado'); process.exit(1) }

const deleted = await prisma.contactRequest.deleteMany({ where: { professionalId: user.id } })
console.log(`Eliminadas ${deleted.count} consulta(s) del profesional ${email}`)
await prisma.$disconnect()
