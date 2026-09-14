import { Link } from 'react-router-dom'
import { Search, Bookmark, MessageCircle } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Buscá y Cotizá',
    desc: 'Filtrá por zona y tipo de servicio. Compará profesionales verificados con sus tarifas reales y valores de referencia oficiales (ARCA/CNTCP).',
  },
  {
    number: '02',
    icon: Bookmark,
    title: 'Preseleccioná',
    desc: 'Guardá tus opciones favoritas en tu lista de preselección. Comparalos fácilmente y elegí el perfil que mejor se adapta a tu familia.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Conectá',
    desc: 'Coordiná el servicio directamente mediante el chat seguro de la plataforma. Sin intermediarios, sin cargos ocultos, en forma directa.',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="block text-xs font-semibold uppercase mb-3"
            style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
            Simple y Transparente
          </span>
          <h2 className="font-heading font-bold mt-1 mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--cuidar-tinta)', letterSpacing: '-0.015em' }}>
            ¿Cómo funciona?
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--cuidar-gris-medio)', fontSize: '15.5px' }}>
            En tres pasos encontrás el profesional ideal para tu hogar, sin sorpresas ni complicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px z-0"
            style={{ background: 'var(--cuidar-borde)' }} />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative z-10 border p-8 text-center transition-colors duration-200"
                style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
              >
                <div className="font-heading font-bold text-6xl leading-none mb-4 select-none"
                  style={{ color: 'var(--cuidar-borde)' }}>
                  {step.number}
                </div>
                <div className="w-14 h-14 border flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-verde-institucional)' }}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--cuidar-tinta)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cuidar-texto)' }}>{step.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold text-base transition-colors"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}
          >
            Comenzar ahora →
          </Link>
        </div>
      </div>
    </section>
  )
}
