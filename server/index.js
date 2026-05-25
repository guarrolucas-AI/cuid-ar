import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import checkoutRoutes from './routes/checkout.js'
import webhookRoutes from './routes/webhooks.js'
import matchRoutes from './routes/match.js'
import professionalRoutes from './routes/professional.js'
import adminRoutes from './routes/admin.js'
import accountRoutes from './routes/account.js'
import parentRoutes from './routes/parent.js'

const app = express()
const PORT = process.env.PORT || 4000

// CORS: acepta localhost en dev, la URL del frontend en prod, y preview URLs de Vercel
const allowed = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://cuid-ar-nine.vercel.app',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    // Acepta orígenes explícitos o cualquier preview URL del mismo proyecto en Vercel
    if (allowed.includes(origin) || /^https:\/\/cuid-ar-[a-z0-9-]+\.vercel\.app$/.test(origin)) {
      return cb(null, true)
    }
    return cb(new Error('CORS'))
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth',         authRoutes)
app.use('/api/checkout',     checkoutRoutes)
app.use('/api/webhooks',     webhookRoutes)
app.use('/api/match',        matchRoutes)
app.use('/api/professional', professionalRoutes)
app.use('/api/admin',        adminRoutes)
app.use('/api/account',     accountRoutes)
app.use('/api/parent',      parentRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// En local levanta el servidor; en Vercel exporta el app como handler
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`CUID_AR server corriendo en http://localhost:${PORT}`))
}

export default app
