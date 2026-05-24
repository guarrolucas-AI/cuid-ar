import { ShieldCheck, Scale, Star, TrendingUp } from 'lucide-react'

const values = [
  {
    icon: ShieldCheck,
    title: 'Verificación y Confianza',
    desc: 'Todos los profesionales pasan por validación de identidad, antecedentes y certificaciones antes de ingresar a la red.',
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-50',
  },
  {
    icon: Scale,
    title: 'Precios Justos y Transparentes',
    desc: 'Aranceles basados en convenios colectivos vigentes (CNTCP, Colegios Profesionales de Bs.As.). Sin precios arbitrarios.',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Star,
    title: 'Profesionalismo Real',
    desc: 'Combatimos la informalidad del sector conectando familias con profesionales registrados, habilitados y comprometidos.',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
  },
  {
    icon: TrendingUp,
    title: 'Mejora Continua',
    desc: 'Sistema de calificaciones bidireccional para que familias y profesionales crezcan y mejoren juntos.',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
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
    <section id="nosotros" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-teal-500 font-semibold text-sm uppercase tracking-widest">Nuestra Misión</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-800 mt-3 mb-6">
            Cuidado con <span className="text-teal-500">propósito</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            En Argentina, el sector del cuidado doméstico históricamente fue marcado por la informalidad
            y los precios arbitrarios. <strong className="text-gray-800">CUID_AR</strong> nace para cambiar
            esa realidad: construimos una red donde cada familia encuentra el cuidado que merece, y cada
            profesional obtiene el reconocimiento que su trabajo requiere.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="font-heading text-4xl font-bold text-teal-500 mb-1">{s.number}</div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Value cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="font-heading font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
