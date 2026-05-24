import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Baby, GraduationCap, Heart, Users, Sparkles } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Cuidado Infantil Profesional',
    subtitle: 'Niñeras certificadas y verificadas para el bienestar de tus hijos',
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    icon: Baby,
    tag: 'Cuidado Infantil',
  },
  {
    id: 2,
    title: 'Apoyo Pedagógico de Calidad',
    subtitle: 'Maestras de apoyo para potenciar el aprendizaje en casa',
    gradient: 'from-amber-400 via-orange-400 to-yellow-500',
    icon: GraduationCap,
    tag: 'Apoyo Educativo',
  },
  {
    id: 3,
    title: 'Salud Pediátrica en el Hogar',
    subtitle: 'Enfermeras especializadas para el cuidado médico de tus hijos',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    icon: Heart,
    tag: 'Salud Pediátrica',
  },
  {
    id: 4,
    title: 'Acompañamiento Terapéutico',
    subtitle: 'Profesionales AT para necesidades especiales e integración social',
    gradient: 'from-emerald-400 via-teal-500 to-green-600',
    icon: Users,
    tag: 'Cuidado Terapéutico',
  },
  {
    id: 5,
    title: 'Hogar Limpio y Organizado',
    subtitle: 'Personal de limpieza profesional, confiable y registrado',
    gradient: 'from-sky-400 via-cyan-500 to-teal-400',
    icon: Sparkles,
    tag: 'Limpieza del Hogar',
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

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length)
        setFade(true)
      }, 280)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const slide = slides[current]
  const Icon = slide.icon

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-500`}
        style={{ opacity: fade ? 1 : 0 }}
      />
      {/* Decorative blobs */}
      <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-8 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div
          className="transition-all duration-300"
          style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(12px)' }}
        >
          {/* Tag */}
          <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-white/30">
            {slide.tag}
          </span>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl drop-shadow-sm">
            Profesionales de confianza para lo que más querés
          </h1>

          <p className="text-xl sm:text-2xl text-white/95 max-w-2xl mb-3 font-semibold">
            {slide.title}
          </p>
          <p className="text-base sm:text-lg text-white/80 max-w-xl mb-10">
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#registro"
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-full hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
            >
              Busco un Profesional
            </a>
            <a
              href="#registro"
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-full border-2 border-white/50 hover:bg-white/30 transition-all backdrop-blur-sm text-base"
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
          <div className="w-52 h-52 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
            <Icon className="w-28 h-28 text-white drop-shadow-lg" strokeWidth={1.2} />
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/30"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/30"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/75'}`}
          />
        ))}
      </div>
    </section>
  )
}
