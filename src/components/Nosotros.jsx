import { ShieldCheck, Scale, Star, TrendingUp } from 'lucide-react'

const values = [
  {
    icon: ShieldCheck,
    title: 'Verificación y Confianza',
    desc: 'Todos los profesionales pasan por validación de identidad, antecedentes y certificaciones antes de ingresar a la red.',
  },
  {
    icon: Scale,
    title: 'Precios Justos y Transparentes',
    desc: 'Aranceles basados en convenios colectivos vigentes (CNTCP, Colegios Profesionales de Bs.As.). Sin precios arbitrarios.',
  },
  {
    icon: Star,
    title: 'Profesionalismo Real',
    desc: 'Combatimos la informalidad del sector conectando familias con profesionales registrados, habilitados y comprometidos.',
  },
  {
    icon: TrendingUp,
    title: 'Mejora Continua',
    desc: 'Sistema de calificaciones bidireccional para que familias y profesionales crezcan y mejoren juntos.',
  },
]

const stats = [
  { number: '5+', label: 'Categorías de Servicio' },
  { number: '100%', label: 'Profesionales Verificados' },
  { number: '0', label: 'Cargos Ocultos' },
  { number: 'GBA', label: 'y CABA' },
]

export default function Nosotros() {
  return (
    <section id="nosotros" className="py-24" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="block text-xs font-semibold uppercase mb-3"
            style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
            Nuestra Misión
          </span>
          <h2 className="font-heading font-bold mt-1 mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--cuidar-tinta)', letterSpacing: '-0.015em' }}>
            Cuidado con propósito
          </h2>
          <p className="max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--cuidar-gris-medio)', fontSize: '15.5px' }}>
            En Argentina, el sector del cuidado doméstico históricamente fue marcado por la informalidad
            y los precios arbitrarios. <strong style={{ color: 'var(--cuidar-tinta)' }}>CuidAR 360</strong> nace para cambiar
            esa realidad: construimos una red donde cada familia encuentra el cuidado que merece, y cada
            profesional obtiene el reconocimiento que su trabajo requiere.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 border"
              style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
              <div className="font-heading text-4xl font-bold mb-1"
                style={{ color: 'var(--cuidar-verde-institucional)' }}>
                {s.number}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--cuidar-gris-suave)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Value cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="border p-6 transition-colors duration-200"
                style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
              >
                <div className="w-11 h-11 border flex items-center justify-center mb-4"
                  style={{ background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-verde-institucional)' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2" style={{ color: 'var(--cuidar-tinta)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cuidar-texto)' }}>{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
