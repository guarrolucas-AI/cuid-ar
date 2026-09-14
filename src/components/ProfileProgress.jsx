import { CheckCircle, Camera, MapPin, Tag, FileText, ShieldCheck, ArrowRight } from 'lucide-react'

const STEPS = [
  { key: 'photo',    label: 'Foto de perfil',            hint: 'Subí una foto profesional desde el encabezado',             icon: Camera,     check: (pro) => !!pro.photoUrl,                                          action: null },
  { key: 'basics',   label: 'Datos y zona',              hint: 'Completá nombre y zona en "Mi Perfil"',                      icon: MapPin,     check: (pro) => !!(pro.name && pro.zone),                               action: 'profile' },
  { key: 'services', label: 'Servicios y tarifa',        hint: 'Seleccioná especialidades y definí tu tarifa',               icon: Tag,        check: (pro) => (pro.categories?.length ?? 0) > 0 && pro.hourlyRate > 0, action: 'rate' },
  { key: 'bio',      label: 'Biografía y experiencia',   hint: 'Escribí una presentación de al menos 20 caracteres',         icon: FileText,   check: (pro) => !!(pro.bio && pro.bio.trim().length > 20),              action: 'profile' },
  { key: 'verified', label: 'Documentación verificada',  hint: 'Enviá tu documentación al equipo CuidAR 360 para ser verificado', icon: ShieldCheck, check: (pro) => !!pro.verified,                              action: null },
]

export default function ProfileProgress({ pro, onScrollTo }) {
  const completed = STEPS.filter((s) => s.check(pro)).length
  const pct       = Math.round((completed / STEPS.length) * 100)
  const missing   = STEPS.filter((s) => !s.check(pro))
  const full      = pct === 100

  return (
    <div className="border-2 overflow-hidden"
      style={{
        background: '#FFFFFF',
        borderColor: full ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-borde)',
      }}>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
              {full && <CheckCircle className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />}
              Nivel de Perfil
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{completed} de {STEPS.length} secciones completas</p>
          </div>
          <span className="text-3xl font-black" style={{ color: full ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-tinta)' }}>{pct}%</span>
        </div>

        {/* Barra principal — esquina viva */}
        <div className="h-3 overflow-hidden" style={{ background: 'var(--cuidar-nieve)' }}>
          <div className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'var(--cuidar-verde-institucional)' }} />
        </div>

        {/* Mini indicadores por paso — esquina viva */}
        <div className="flex gap-1.5 mt-2">
          {STEPS.map((s) => (
            <div key={s.key} className="flex-1 h-1.5 transition-all duration-500"
              style={{ background: s.check(pro) ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-borde)' }} />
          ))}
        </div>
      </div>

      {full ? (
        <div className="px-5 pb-5">
          <div className="p-4 text-center" style={{ background: 'var(--cuidar-verde-institucional)' }}>
            <p className="text-base font-black text-white">Perfil Completo 100%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cuidar-verde-300)' }}>
              Tu perfil aparece primero en los resultados de búsqueda.
            </p>
          </div>
        </div>
      ) : (
        missing.length > 0 && (
          <div className="px-5 pt-4 pb-5 space-y-2.5" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--cuidar-gris-suave)' }}>Pendiente</p>
            {missing.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--cuidar-gris-suave)' }} />
                  </div>
                  <p className="text-xs flex-1 leading-tight" style={{ color: 'var(--cuidar-gris-medio)' }}>{s.hint}</p>
                  {s.action && (
                    <button onClick={() => onScrollTo?.(s.action)}
                      className="flex items-center gap-0.5 text-xs font-semibold flex-shrink-0 transition-colors"
                      style={{ color: 'var(--cuidar-verde-institucional)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
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
