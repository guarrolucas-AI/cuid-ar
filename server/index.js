import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import checkoutRoutes from './routes/checkout.js'
import webhookRoutes from './routes/webhooks.js'
import matchRoutes from './routes/match.js'
import professionalRoutes from './routes/professional.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.FRONTEND_URL }))

// El webhook de MP necesita el body raw para validar la firma
app.use('/api/webhooks/mercadopago', express.raw({ type: 'application/json' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/professional', professionalRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`CUID_AR server corriendo en http://localhost:${PORT}`))
