import { useState, useEffect } from 'react'
import { Info, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORY_META = [
  { category: 'limpieza',    servicio: 'Limpieza del Hogar' },
  { category: 'infantil',    servicio: 'Niñeras / Cuidado Infantil' },
  { category: 'pedagogico',  servicio: 'Maestras de Apoyo' },
  { category: 'terapeutico', servicio: 'Acompañante Terapéutico (AT)' },
  { category: 'salud',       servicio: 'Enfermeras Pediátricas' },
]

const money = (n) => (n == null ? null : `$${Math.round(n).toLocaleString('es-AR')}`)

export default function Aranceles() {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/match/rates`)
      .then((r) => r.json())
      .then((data) => { setDetails(data.details ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const vigenciaSource = details && Object.values(details).find((d) => d?.source)?.source

  const rows = CATEGORY_META.map((meta) => {
    const d = details?.[meta.category]
    const hora = money(d?.officialRate)
    const mensualConRetiro = d?.officialRateMonthly != null ? money(d.officialRateMonthly) : null
    return {
      ...meta,
      hora,
      parcial: hora ? `${money(d.officialRate * 4)} (4 hs)` : null,
      completa: hora ? `${money(d.officialRate * 8)} (8 hs)` : null,
      mensual: mensualConRetiro ? `${mensualConRetiro} (Con retiro)` : null,
    }
  })

  return (
    <section id="aranceles" className="py-24" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="block text-xs font-semibold uppercase mb-3"
            style={{ color: 'var(--cuidar-agua-clara)', letterSpacing: '0.18em' }}>
            Precios Transparentes
          </span>
          <h2 className="font-heading font-bold mt-1 mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--cuidar-tinta)', letterSpacing: '-0.015em' }}>
            Aranceles y Valores de Referencia
          </h2>
          {vigenciaSource && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold mt-1"
              style={{ background: 'var(--cuidar-agua-soft)', color: 'var(--cuidar-agua-clara)', borderRadius: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cuidar-agua-clara)', display: 'inline-block' }} />
              {vigenciaSource}
            </span>
          )}
          <p className="mt-5 max-w-2xl mx-auto text-base" style={{ color: 'var(--cuidar-gris-medio)' }}>
            Valores tomados en vivo de la fuente oficial (ARCA — Casas Particulares) cuando existe un nomenclador único.
            Donde no hay uno, lo marcamos como "a confirmar" en vez de estimar un número.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando valores oficiales…
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block border overflow-hidden" style={{ borderColor: 'var(--cuidar-borde)' }}>
              {/* Table header — verde institucional con agua como acento */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ background: 'var(--cuidar-verde-institucional)' }}>
                <div>
                  <p className="font-heading font-semibold text-base" style={{ color: '#F6F8F6' }}>
                    Aranceles de Referencia
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-verde-300)' }}>
                    Convenio Colectivo CNTCP / Colegios Profesionales Bs.As.
                  </p>
                </div>
                {vigenciaSource && (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
                    style={{ background: 'var(--cuidar-agua-soft)', color: 'var(--cuidar-agua-clara)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cuidar-agua-clara)', display: 'inline-block' }} />
                    Actualizado · {vigenciaSource}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto" style={{ background: 'var(--cuidar-papel)' }}>
                <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: 'var(--cuidar-font-ui)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--cuidar-borde)' }}>
                      {['Servicio', 'Por Hora', 'Jornada Parcial', 'Jornada Completa', 'Mensual'].map((h, i) => (
                        <th key={h} className={`py-3 text-xs font-semibold uppercase ${i === 0 ? 'text-left px-6' : 'text-right px-5'}`}
                          style={{ color: 'var(--cuidar-gris-suave)', letterSpacing: '0.12em', borderBottom: '1px solid var(--cuidar-borde)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.servicio}
                        style={{ borderBottom: '1px solid var(--cuidar-borde)', background: i % 2 === 0 ? '#FFFFFF' : 'var(--cuidar-nieve)' }}>
                        <td className="px-6 py-4">
                          <span className="font-heading font-semibold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>
                            {row.servicio}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {row.hora
                            ? <span className="font-heading font-semibold text-base"
                                style={{ color: 'var(--cuidar-agua-clara)', fontVariantNumeric: 'tabular-nums' }}>
                                {row.hora}
                              </span>
                            : <span className="text-xs italic" style={{ color: 'var(--cuidar-gris-suave)' }}>A confirmar</span>}
                        </td>
                        <td className="px-5 py-4 text-right text-sm" style={{ color: 'var(--cuidar-gris-medio)', fontVariantNumeric: 'tabular-nums' }}>{row.parcial ?? '—'}</td>
                        <td className="px-5 py-4 text-right text-sm" style={{ color: 'var(--cuidar-gris-medio)', fontVariantNumeric: 'tabular-nums' }}>{row.completa ?? '—'}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold" style={{ color: 'var(--cuidar-texto)', fontVariantNumeric: 'tabular-nums' }}>
                            {row.mensual ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {rows.map((row) => (
                <div key={row.servicio} className="border p-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading font-semibold" style={{ color: 'var(--cuidar-tinta)', lineHeight: 1.3 }}>{row.servicio}</h3>
                    <div className="text-right ml-4 flex-shrink-0">
                      {row.hora
                        ? <>
                            <div className="font-heading font-semibold text-2xl"
                              style={{ color: 'var(--cuidar-agua-clara)', fontVariantNumeric: 'tabular-nums' }}>
                              {row.hora}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>por hora</div>
                          </>
                        : <div className="text-xs italic" style={{ color: 'var(--cuidar-gris-suave)' }}>A confirmar</div>}
                    </div>
                  </div>
                  {row.hora && (
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div className="p-3" style={{ background: 'var(--cuidar-nieve)', borderLeft: '2px solid var(--cuidar-borde)' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: 'var(--cuidar-gris-suave)' }}>Parcial</div>
                        <div className="font-semibold text-xs" style={{ color: 'var(--cuidar-texto)', fontVariantNumeric: 'tabular-nums' }}>{row.parcial}</div>
                      </div>
                      <div className="p-3" style={{ background: 'var(--cuidar-nieve)', borderLeft: '2px solid var(--cuidar-borde)' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: 'var(--cuidar-gris-suave)' }}>Completa</div>
                        <div className="font-semibold text-xs" style={{ color: 'var(--cuidar-texto)', fontVariantNumeric: 'tabular-nums' }}>{row.completa}</div>
                      </div>
                      {row.mensual && (
                        <div className="p-3 col-span-2" style={{ background: 'var(--cuidar-agua-soft)', borderLeft: '2px solid var(--cuidar-agua-clara)' }}>
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--cuidar-agua-clara)' }}>Mensual</div>
                          <div className="font-semibold text-xs" style={{ color: 'var(--cuidar-tinta)', fontVariantNumeric: 'tabular-nums' }}>{row.mensual}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Legal note */}
        <div className="mt-8 flex items-start gap-3 border p-5"
          style={{ borderColor: 'var(--cuidar-borde)', background: '#FFFFFF' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cuidar-gris-medio)' }}>
            <strong style={{ color: 'var(--cuidar-tinta)' }}>Nota legal:</strong> Cuidado Infantil y Limpieza del Hogar se calculan en tiempo real desde la escala
            salarial oficial de ARCA (ex AFIP) para Personal de Casas Particulares. Las demás categorías no tienen un
            nomenclador nacional único (dependen de cada obra social o colegio profesional) y se muestran "a
            confirmar" hasta que el equipo cargue una referencia. Los valores reales pueden variar según
            experiencia, certificaciones y acuerdo entre las partes. CuidAR 360 actúa como plataforma intermediaria y no
            determina los honorarios finales.
          </p>
        </div>
      </div>
    </section>
  )
}
