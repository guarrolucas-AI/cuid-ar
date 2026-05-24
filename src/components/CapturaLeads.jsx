import { UserCheck, Search, ArrowRight, CheckCircle } from 'lucide-react'

// ⚙️ CONFIGURACIÓN: Reemplazá con tus URLs de Google Forms / Typeform antes del lanzamiento
const URL_FORM_FAMILIAS = 'https://forms.gle/REEMPLAZAR_CON_TU_FORM'
const URL_FORM_PROFESIONALES = 'https://forms.gle/REEMPLAZAR_CON_TU_FORM'

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
    <section id="registro" className="py-24 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4">
            ¿Cómo podemos ayudarte?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Elegí tu camino y unite a la red de cuidado más confiable de Buenos Aires
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Card Familias */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-teal-600" />
            </div>
            <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Para familias</span>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-gray-800 mt-2 mb-4">
              Busco un Profesional de Cuidado
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Encontrá al profesional ideal para tu familia de forma fácil, rápida y con total transparencia en precios y credenciales.
            </p>
            <ul className="space-y-3 mb-8">
              {beneficiosFamilias.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href={URL_FORM_FAMILIAS}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              Quiero encontrar un profesional
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Card Profesionales */}
          <div className="bg-white/12 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border-2 border-white/30">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Para profesionales</span>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mt-2 mb-4">
              Quiero registrarme como Profesional
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Unite a la red y conectá con familias que valoran tu trabajo. Gestioná tu agenda con autonomía y a precios justos.
            </p>
            <ul className="space-y-3 mb-8">
              {beneficiosProfesionales.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-white/85">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href={URL_FORM_PROFESIONALES}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              Registrarme como profesional
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
