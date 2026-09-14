import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconInfantil, IconPedagogico, IconSalud, IconTerapeutico, IconLimpieza } from '../lib/serviceIcons'

const slides = [
  {
    id: 1,
    title: 'Cuidado Infantil Profesional',
    subtitle: 'Niñeras certificadas y verificadas para el bienestar de tus hijos',
    tag: 'Cuidado Infantil',
    Icon: IconInfantil,
  },
  {
    id: 2,
    title: 'Apoyo Pedagógico de Calidad',
    subtitle: 'Maestras de apoyo para potenciar el aprendizaje en casa',
    tag: 'Apoyo Pedagógico',
    Icon: IconPedagogico,
  },
  {
    id: 3,
    title: 'Salud Pediátrica en el Hogar',
    subtitle: 'Enfermeras especializadas para el cuidado médico de tus hijos',
    tag: 'Salud Pediátrica',
    Icon: IconSalud,
  },
  {
    id: 4,
    title: 'Acompañamiento Terapéutico',
    subtitle: 'Profesionales AT para necesidades especiales e integración social',
    tag: 'Cuidado Terapéutico',
    Icon: IconTerapeutico,
  },
  {
    id: 5,
    title: 'Hogar Limpio y Organizado',
    subtitle: 'Personal de limpieza profesional, confiable y registrado',
    tag: 'Limpieza del Hogar',
    Icon: IconLimpieza,
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  const goTo = useCallback((idx) => {
    setFade(false)
    setTimeout(() => {
      setCurrent(idx)
      setFade(true)
    }, 280)
  }, [])

  const next = useCallback(() => { goTo((current + 1) % slides.length) }, [current, goTo])
  const prev = useCallback(() => { goTo((current - 1 + slides.length) % slides.length) }, [current, goTo])

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => { setCurrent((c) => (c + 1) % slides.length); setFade(true) }, 280)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const slide = slides[current]
  const { Icon } = slide

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ background: 'linear-gradient(135deg, #1F4D3A 0%, #1A4030 60%, #14201B 100%)' }}>

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #3FB7A6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #9FB6A8 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div
          className="transition-all duration-300"
          style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(12px)' }}
        >
          {/* Eyebrow */}
          <span className="inline-block text-xs font-semibold px-4 py-1.5 mb-6 uppercase tracking-widest border"
            style={{ color: '#9FB6A8', borderColor: 'rgba(159,182,168,0.4)', background: 'rgba(159,182,168,0.1)', letterSpacing: '0.18em' }}>
            {slide.tag}
          </span>

          {/* Headline */}
          <h1 className="font-heading font-bold text-white leading-tight mb-6 max-w-4xl"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
            Profesionales de confianza para lo que más querés
          </h1>

          <p className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#F6F8F6' }}>
            {slide.title}
          </p>
          <p className="text-base sm:text-lg mb-10" style={{ color: 'rgba(246,248,246,0.72)' }}>
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/buscar"
              className="px-8 py-4 font-bold text-base transition-colors"
              style={{ background: '#F6F8F6', color: '#1F4D3A' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F6F8F6'}
            >
              Busco un Profesional
            </Link>
            <a
              href="#registro"
              className="px-8 py-4 font-bold text-base border-2 transition-colors"
              style={{ color: '#F6F8F6', borderColor: 'rgba(246,248,246,0.45)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(246,248,246,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Soy Profesional
            </a>
          </div>
        </div>

        {/* Floating icon — desktop */}
        <div
          className="absolute right-12 lg:right-24 top-1/2 -translate-y-1/2 hidden lg:flex"
          style={{ opacity: fade ? 1 : 0, transform: `translateY(-50%) scale(${fade ? 1 : 0.9})`, transition: 'opacity 300ms, transform 300ms' }}
        >
          <div className="w-52 h-52 flex items-center justify-center border"
            style={{ background: 'rgba(246,248,246,0.08)', borderColor: 'rgba(246,248,246,0.2)' }}>
            <Icon size={96} style={{ color: '#F6F8F6' }} />
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border transition-colors"
        style={{ background: 'rgba(246,248,246,0.12)', borderColor: 'rgba(246,248,246,0.25)', color: '#F6F8F6' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(246,248,246,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(246,248,246,0.12)'}
        aria-label="Anterior">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border transition-colors"
        style={{ background: 'rgba(246,248,246,0.12)', borderColor: 'rgba(246,248,246,0.25)', color: '#F6F8F6' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(246,248,246,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(246,248,246,0.12)'}
        aria-label="Siguiente">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className="transition-all duration-300"
            style={{ borderRadius: 0, width: i === current ? 32 : 12, height: 4, background: i === current ? '#F6F8F6' : 'rgba(246,248,246,0.4)' }}
          />
        ))}
      </div>
    </section>
  )
}
