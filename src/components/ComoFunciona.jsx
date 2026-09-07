import { Link } from 'react-router-dom'
import { Search, Bookmark, MessageCircle } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Buscá y Cotizá',
    desc: 'Filtrá por zona y tipo de servicio. Compará profesionales verificados con sus tarifas reales y valores de referencia oficiales (ARCA/CNTCP).',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    number: '02',
    icon: Bookmark,
    title: 'Preseleccioná',
    desc: 'Guardá tus opciones favoritas en tu lista de preselección. Comparalos fácilmente y elegí el perfil que mejor se adapta a tu familia.',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Conectá',
    desc: 'Coordiná el servicio directamente mediante el chat seguro de la plataforma. Sin intermediarios, sin cargos ocultos, en forma directa.',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-teal-500 font-semibold text-sm uppercase tracking-widest">Simple y Transparente</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-800 mt-3 mb-6">
            ¿Cómo <span className="text-teal-500">funciona</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En tres pasos encontrás el profesional ideal para tu hogar, sin sorpresas ni complicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gray-200 z-0" />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative z-10 bg-white rounded-3xl border-2 border-gray-100 p-8 text-center hover:shadow-lg hover:border-gray-200 transition-all duration-200">
                <div className="text-6xl font-heading font-bold text-gray-100 leading-none mb-4 select-none">
                  {step.number}
                </div>
                <div className={`w-16 h-16 rounded-2xl ${step.iconBg} border-2 ${step.border} flex items-center justify-center mx-auto mb-5`}>
                  <Icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>
                <h3 className="font-heading font-bold text-xl text-gray-800 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl text-base transition-colors shadow-md hover:shadow-lg"
          >
            Comenzar ahora →
          </Link>
        </div>
      </div>
    </section>
  )
}
