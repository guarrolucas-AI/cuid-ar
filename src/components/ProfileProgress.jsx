import { CheckCircle, Camera, MapPin, Tag, FileText, ShieldCheck, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    key:    'photo',
    label:  'Foto de perfil',
    hint:   'Subí una foto profesional desde el encabezado',
    icon:   Camera,
    check:  (pro) => !!pro.photoUrl,
    action: null,
  },
  {
    key:    'basics',
    label:  'Datos y zona',
    hint:   'Completá nombre y zona en "Mi Perfil"',
    icon:   MapPin,
    check:  (pro) => !!(pro.name && pro.zone),
    action: 'profile',
  },
  {
    key:    'services',
    label:  'Servicios y tarifa',
    hint:   'Seleccioná especialidades y definí tu tarifa',
    icon:   Tag,
    check:  (pro) => (pro.categories?.length ?? 0) > 0 && pro.hourlyRate > 0,
    action: 'rate',
  },
  {
    key:    'bio',
    label:  'Biografía y experiencia',
    hint:   'Escribí una presentación de al menos 20 caracteres',
    icon:   FileText,
    check:  (pro) => !!(pro.bio && pro.bio.trim().length > 20),
    action: 'profile',
  },
  {
    key:    'verified',
    label:  'Documentación verificada',
    hint:   'Enviá tu documentación al equipo CuidAR para ser verificado',
    icon:   ShieldCheck,
    check:  (pro) => !!pro.verified,
    action: null,
  },
]

export default function ProfileProgress({ pro, onScrollTo }) {
  const completed = STEPS.filter((s) => s.check(pro)).length
  const pct       = Math.round((completed / STEPS.length) * 100)
  const missing   = STEPS.filter((s) => !s.check(pro))
  const full      = pct === 100

  return (
    <div className={`rounded-2xl shadow-sm border-2 overflow-hidden ${full ? 'border-teal-300' : 'border-gray-100 bg-white'}`}
      style={full ? { background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' } : {}}>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2 text-sm">
              {full && <CheckCircle className="w-5 h-5 text-teal-500" />}
              Nivel de Perfil
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{completed} de {STEPS.length} secciones completas</p>
          </div>
          <span className={`text-3xl font-black ${full ? 'text-teal-600' : 'text-gray-700'}`}>{pct}%</span>
        </div>

        {/* Barra principal */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${full ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-blue-400 to-teal-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Mini indicadores por paso */}
        <div className="flex gap-1.5 mt-2">
          {STEPS.map((s) => (
            <div
              key={s.key}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s.check(pro) ? 'bg-teal-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {full ? (
        <div className="px-5 pb-5">
          <div className="bg-teal-500 text-white rounded-2xl p-4 text-center">
            <p className="text-base font-black">Perfil Completo 100%</p>
            <p className="text-xs text-teal-100 mt-1">
              Tu perfil aparece primero en los resultados de búsqueda.
            </p>
          </div>
        </div>
      ) : (
        missing.length > 0 && (
          <div className="border-t border-gray-100 px-5 pt-4 pb-5 space-y-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pendiente</p>
            {missing.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 flex-1 leading-tight">{s.hint}</p>
                  {s.action && (
                    <button
                      onClick={() => onScrollTo?.(s.action)}
                      className="flex items-center gap-0.5 text-xs text-teal-600 font-semibold hover:text-teal-700 flex-shrink-0"
                    >
                      Ir <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
