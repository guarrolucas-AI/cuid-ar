import { Link } from 'react-router-dom'
import { UserCheck, Search, ArrowRight, CheckCircle } from 'lucide-react'

const beneficiosFamilias = [
  'Profesionales verificados con antecedentes limpios',
  'Precios transparentes basados en convenios vigentes',
  'Perfil completo con calificaciones y reseñas reales',
  'Contratación simple, segura y sin intermediarios',
]

const beneficiosProfesionales = [
  'Accedé a familias que valoran tu trabajo y tus credenciales',
  'Tarifas justas acordes a tu especialización y convenio',
  'Gestioná tu agenda de forma autónoma e independiente',
  'Comunidad profesional de respaldo y visibilidad',
]

export default function CapturaLeads() {
  return (
    <section id="registro" className="py-24 relative overflow-hidden"
      style={{ background: 'var(--cuidar-verde-institucional)' }}>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="block text-xs font-semibold uppercase mb-3"
            style={{ color: 'var(--cuidar-agua-clara)', letterSpacing: '0.18em' }}>
            Unite a la Red
          </span>
          <h2 className="font-heading font-bold text-white mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.015em' }}>
            ¿Cómo podemos ayudarte?
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'rgba(246,248,246,0.72)', fontSize: '15.5px' }}>
            Elegí tu camino y unite a la red de cuidado más confiable de Buenos Aires
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Card Familias */}
          <div className="p-8 lg:p-10" style={{ background: '#FFFFFF' }}>
            <div className="w-14 h-14 border flex items-center justify-center mb-6"
              style={{ background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-verde-institucional)' }}>
              <Search className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold uppercase"
              style={{ color: 'var(--cuidar-gris-suave)', letterSpacing: '0.18em' }}>
              Para familias
            </span>
            <h3 className="font-heading font-bold text-2xl lg:text-3xl mt-2 mb-4"
              style={{ color: 'var(--cuidar-tinta)' }}>
              Busco un Profesional de Cuidado
            </h3>
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--cuidar-texto)', fontSize: '15px' }}>
              Encontrá al profesional ideal para tu familia de forma fácil, rápida y con total transparencia en precios y credenciales.
            </p>
            <ul className="space-y-3 mb-8">
              {beneficiosFamilias.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cuidar-texto)' }}>
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to="/register?role=padre"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 text-white font-bold text-base transition-colors group"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}
            >
              Quiero encontrar un profesional
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card Profesionales */}
          <div className="p-8 lg:p-10 border-2"
            style={{ background: 'rgba(246,248,246,0.07)', borderColor: 'rgba(246,248,246,0.2)' }}>
            <div className="w-14 h-14 flex items-center justify-center mb-6"
              style={{ background: 'rgba(246,248,246,0.12)', border: '1px solid rgba(246,248,246,0.25)', color: '#F6F8F6' }}>
              <UserCheck className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold uppercase" style={{ color: 'rgba(246,248,246,0.6)', letterSpacing: '0.18em' }}>
              Para profesionales
            </span>
            <h3 className="font-heading font-bold text-2xl lg:text-3xl mt-2 mb-4" style={{ color: '#F6F8F6' }}>
              Quiero registrarme como Profesional
            </h3>
            <p className="mb-6 leading-relaxed" style={{ color: 'rgba(246,248,246,0.72)', fontSize: '15px' }}>
              Unite a la red y conectá con familias que valoran tu trabajo. Gestioná tu agenda con autonomía y a precios justos.
            </p>
            <ul className="space-y-3 mb-8">
              {beneficiosProfesionales.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(246,248,246,0.80)' }}>
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F6F8F6' }} />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to="/register?role=profesional"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-base transition-colors group"
              style={{ background: '#F6F8F6', color: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F6F8F6'}
            >
              Registrarme como profesional
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
