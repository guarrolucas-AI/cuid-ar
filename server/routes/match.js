import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { auth, optionalAuth } from '../middleware/auth.js'
import { sendEmail, tpl } from '../lib/email.js'
import { toProfessionalView } from '../lib/professionalView.js'

const router = Router()

const CATEGORY_LABELS = {
  infantil: 'Cuidado Infantil', pedagogico: 'Apoyo Pedagógico',
  salud: 'Salud Pediátrica', terapeutico: 'Cuidado Terapéutico', limpieza: 'Limpieza del Hogar',
}

const DEFAULT_RESULT_LIMIT = 30

async function getOfficialRates() {
  const rows = await prisma.serviceRate.findMany()
  return Object.fromEntries(rows.map((r) => [r.category, r.officialRate]))
}

async function getRateTolerance() {
  const config = await prisma.appConfig.findUnique({ where: { key: 'rate_tolerance_ars' } })
  return config ? parseFloat(config.value) : 5000
}

// GET /api/match/rates — tarifas de referencia oficiales por categoría y la
// tolerancia vigente. Público: sirve tanto para mostrarlo a un visitante
// como para la calculadora de multiservicio.
router.get('/rates', async (req, res) => {
  try {
    const [rates, toleranceArs] = await Promise.all([getOfficialRates(), getRateTolerance()])
    res.json({ rates, toleranceArs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/match/search?zone=CABA&category=infantil&maxRate=8000&lat=-34.6&lng=-58.4
//
// Público: cualquier visitante ve el listado (nombre, foto, zona, categoría,
// tarifa estimada, verificado, distancia si hay coordenadas). Si además está
// logueado y abonado, ve los campos extra de toProfessionalView. Nunca se
// devuelve teléfono, mail, DNI ni dirección — eso no sale de la API bajo
// ningún nivel.
//
// Si se mandan lat/lng (geolocalización del navegador, o las guardadas en
// el perfil del padre logueado), se ordena por cercanía real y se cruza con
// el radio de traslado del profesional (no sugiere traslados inviables).
// Sin coordenadas, cae al comportamiento anterior: ordenado por tarifa.
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { zone, category, maxRate } = req.query
    let { lat, lng, maxDistanceKm } = req.query

    // Sin coordenadas en la URL: si hay un padre logueado con dirección
    // geocodificada guardada, usamos esas por default.
    if ((!lat || !lng) && req.user?.role === 'padre') {
      const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } })
      if (parent?.lat != null && parent?.lng != null) {
        lat = parent.lat
        lng = parent.lng
        maxDistanceKm = maxDistanceKm ?? parent.maxDistanceKm
      }
    }

    const viewerSubscribed = req.user?.status === 'subscribed'
    const hasCoords = lat != null && lng != null && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng))
    const officialRates = viewerSubscribed ? await getOfficialRates() : {}

    if (!hasCoords) {
      // Fallback sin geolocalización: mismo comportamiento de antes.
      const professionals = await prisma.professional.findMany({
        where: {
          available: true,
          verified: true,
          user: { status: 'subscribed' },
          ...(zone     && { zone }),
          ...(category && { category }),
          ...(maxRate  && { hourlyRate: { lte: parseFloat(maxRate) } }),
        },
        orderBy: { hourlyRate: 'asc' },
        take: DEFAULT_RESULT_LIMIT,
      })
      return res.json(professionals.map((pro) => toProfessionalView(pro, viewerSubscribed, officialRates[pro.category] ?? null)))
    }

    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const maxDistNum = maxDistanceKm ? parseFloat(maxDistanceKm) : null

    // Haversine en SQL (sin depender de PostGIS): distancia en km entre el
    // punto del visitante y cada profesional geocodificado. Se descarta a
    // quien no llega a cubrir esa distancia con su radio de traslado.
    const professionals = await prisma.$queryRaw`
      SELECT p.*,
        ( 6371 * acos(
            LEAST(1, GREATEST(-1,
              cos(radians(${latNum})) * cos(radians(p."lat")) * cos(radians(p."lng") - radians(${lngNum}))
              + sin(radians(${latNum})) * sin(radians(p."lat"))
            ))
        ) ) AS "distanceKm"
      FROM "Professional" p
      INNER JOIN "User" u ON u."id" = p."userId"
      WHERE p."available" = true
        AND p."verified" = true
        AND u."status" = 'subscribed'
        AND p."lat" IS NOT NULL AND p."lng" IS NOT NULL
        ${zone ? Prisma.sql`AND p."zone" = ${zone}` : Prisma.empty}
        ${category ? Prisma.sql`AND p."category" = ${category}` : Prisma.empty}
        ${maxRate ? Prisma.sql`AND p."hourlyRate" <= ${parseFloat(maxRate)}` : Prisma.empty}
      ORDER BY "distanceKm" ASC
      LIMIT ${DEFAULT_RESULT_LIMIT * 3}
    `

    const inRange = professionals.filter((pro) => {
      const radius = pro.travelRadiusKm ?? Infinity
      if (pro.distanceKm > radius) return false
      if (maxDistNum != null && pro.distanceKm > maxDistNum) return false
      return true
    }).slice(0, DEFAULT_RESULT_LIMIT)

    res.json(inRange.map((pro) => toProfessionalView(pro, viewerSubscribed, officialRates[pro.category] ?? null)))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/match/notify
router.post('/notify', auth, async (req, res) => {
  try {
    if (req.user.status !== 'subscribed')
      return res.status(403).json({ error: 'Se requiere suscripción activa' })
    const { professionalId, category } = req.body

    const [professional, parent] = await Promise.all([
      prisma.professional.findUnique({ where: { userId: professionalId }, include: { user: true } }),
      prisma.parent.findUnique({ where: { userId: req.user.id } }),
    ])

    if (!professional || !parent) return res.status(404).json({ error: 'Datos no encontrados' })
    if (!professional.verified || professional.user.status !== 'subscribed')
      return res.status(403).json({ error: 'Profesional no disponible' })

    await prisma.contactRequest.create({
      data: { professionalId: professional.userId, parentId: parent.userId, category },
    })

    // Un solo hilo de chat por par profesional-padre: si ya se habían
    // contactado antes (otra categoría), reusa la conversación existente
    // en vez de crear una nueva.
    const conversation = await prisma.conversation.upsert({
      where: { professionalId_parentId: { professionalId: professional.userId, parentId: parent.userId } },
      update: {},
      create: { professionalId: professional.userId, parentId: parent.userId, category },
    })

    const label = CATEGORY_LABELS[category] ?? category
    const { subject, html } = tpl.notify(professional.name, parent.name, parent.phone, parent.address, label)
    await sendEmail({ to: professional.user.email, subject, html })

    res.json({ success: true, conversationId: conversation.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
