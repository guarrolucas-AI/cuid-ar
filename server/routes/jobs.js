import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

const CAT_LABELS = {
  infantil: 'Cuidado Infantil', pedagogico: 'Apoyo Pedagógico',
  salud: 'Salud Pediátrica', terapeutico: 'Cuidado Terapéutico', limpieza: 'Limpieza del Hogar',
}

// POST /api/jobs — la familia publica una búsqueda
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'padre')
      return res.status(403).json({ error: 'Solo las familias pueden publicar búsquedas' })

    const { category, zone, days, schedule, modality, requirements, notes } = req.body
    if (!category || !zone || !schedule || !modality)
      return res.status(400).json({ error: 'Faltan campos obligatorios' })

    const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } })
    if (!parent) return res.status(404).json({ error: 'Perfil de familia no encontrado' })

    const job = await prisma.jobPost.create({
      data: {
        parentId: parent.userId,
        category,
        zone,
        days: Array.isArray(days) ? days : [],
        schedule,
        modality,
        requirements: Array.isArray(requirements) ? requirements : [],
        notes: notes ?? null,
      },
    })
    res.status(201).json(job)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/jobs — listado de búsquedas activas para profesionales
// Filtra por zona y/o categoría del profesional si está logueado
router.get('/', auth, async (req, res) => {
  try {
    const { category, zone } = req.query
    const jobs = await prisma.jobPost.findMany({
      where: {
        status: 'active',
        ...(category && { category }),
        ...(zone     && { zone }),
      },
      include: {
        _count: { select: { applications: true } },
        applications: {
          where: { professionalId: req.user.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json(jobs.map((j) => ({
      id: j.id,
      category: j.category,
      categoryLabel: CAT_LABELS[j.category] ?? j.category,
      zone: j.zone,
      days: j.days,
      schedule: j.schedule,
      modality: j.modality,
      requirements: j.requirements,
      notes: j.notes,
      status: j.status,
      createdAt: j.createdAt,
      applicantCount: j._count.applications,
      alreadyApplied: j.applications.length > 0,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/jobs/:id/apply — profesional se postula
router.post('/:id/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'profesional')
      return res.status(403).json({ error: 'Solo los profesionales pueden postularse' })

    const job = await prisma.jobPost.findUnique({ where: { id: req.params.id } })
    if (!job || job.status !== 'active')
      return res.status(404).json({ error: 'Búsqueda no encontrada o cerrada' })

    const application = await prisma.jobApplication.create({
      data: { jobPostId: job.id, professionalId: req.user.id },
    })
    res.status(201).json(application)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya te postulaste a esta búsqueda' })
    res.status(500).json({ error: err.message })
  }
})

// GET /api/jobs/mine — búsquedas publicadas por la familia logueada
router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'padre')
      return res.status(403).json({ error: 'Solo las familias pueden ver sus búsquedas' })

    const jobs = await prisma.jobPost.findMany({
      where: { parentId: req.user.id },
      include: {
        _count: { select: { applications: true } },
        applications: {
          include: {
            professional: { select: { name: true, photoUrl: true, categories: true, hourlyRate: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(jobs.map((j) => ({
      id: j.id,
      category: j.category,
      categoryLabel: CAT_LABELS[j.category] ?? j.category,
      zone: j.zone,
      days: j.days,
      schedule: j.schedule,
      modality: j.modality,
      requirements: j.requirements,
      notes: j.notes,
      status: j.status,
      createdAt: j.createdAt,
      applicantCount: j._count.applications,
      applicants: j.applications.map((a) => ({
        applicationId: a.id,
        applicationStatus: a.status,
        createdAt: a.createdAt,
        ...a.professional,
      })),
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/jobs/:id — la familia abre/cierra su búsqueda
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'closed'].includes(status))
      return res.status(400).json({ error: 'Estado inválido' })

    const job = await prisma.jobPost.findUnique({ where: { id: req.params.id } })
    if (!job || job.parentId !== req.user.id)
      return res.status(404).json({ error: 'Búsqueda no encontrada' })

    const updated = await prisma.jobPost.update({
      where: { id: req.params.id },
      data: { status },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
