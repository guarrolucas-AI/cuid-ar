import { useState, useEffect } from 'react'
import { Info, TrendingUp, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Metadata de presentación por categoría — el valor en $ viene siempre de
// /api/match/rates (ServiceRate en la base), nunca hardcodeado acá. Las
// categorías sin fuente oficial única (pedagogico/terapeutico/salud) se
// muestran como "A confirmar" en vez de inventar un número.
const CATEGORY_META = [
  { category: 'limpieza',    servicio: 'Limpieza del Hogar',           rowBg: 'hover:bg-sky-50/40' },
  { category: 'infantil',    servicio: 'Niñeras / Cuidado Infantil',   rowBg: 'hover:bg-teal-50/40' },
  { category: 'pedagogico',  servicio: 'Maestras de Apoyo',            rowBg: 'hover:bg-amber-50/40' },
  { category: 'terapeutico', servicio: 'Acompañante Terapéutico (AT)', rowBg: 'hover:bg-emerald-50/40' },
  { category: 'salud',       servicio: 'Enfermeras Pediátricas',       rowBg: 'hover:bg-blue-50/40' },
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

  // Vigencia a mostrar en el badge: la de cualquier categoría que tenga
  // fuente automática cargada (hoy todas comparten la misma, de ARCA).
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
    <section id="aranceles" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-teal-500 font-semibold text-sm uppercase tracking-widest">Precios Transparentes</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-800 mt-3 mb-4">
            Aranceles y Valores de <span className="text-teal-500">Referencia</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-teal-500 text-white text-sm font-bold px-5 py-2 rounded-full mt-1">
            <TrendingUp className="w-4 h-4" />
            {vigenciaSource ?? 'Fuente oficial en tiempo real'}
          </div>
          <p className="text-gray-600 mt-5 max-w-2xl mx-auto text-base">
            Valores tomados en vivo de la fuente oficial (ARCA — Casas Particulares) cuando existe un nomenclador único.
            Donde no hay uno, lo marcamos como &ldquo;a confirmar&rdquo; en vez de estimar un número.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando valores oficiales…
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      <th className="text-left px-6 py-5 font-heading font-semibold text-sm">Servicio</th>
                      <th className="text-center px-5 py-5 font-heading font-semibold text-sm">Por Hora</th>
                      <th className="text-center px-5 py-5 font-heading font-semibold text-sm">Jornada Parcial</th>
                      <th className="text-center px-5 py-5 font-heading font-semibold text-sm">Jornada Completa</th>
                      <th className="text-center px-5 py-5 font-heading font-semibold text-sm">Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={row.servicio}
                        className={`border-t border-gray-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${row.rowBg}`}
                      >
                        <td className="px-6 py-5">
                          <div className="font-heading font-bold text-gray-800">{row.servicio}</div>
                        </td>
                        <td className="px-5 py-5 text-center">
                          {row.hora
                            ? <span className="font-bold text-teal-600 text-lg">{row.hora}</span>
                            : <span className="text-xs text-gray-400 italic">A confirmar</span>}
                        </td>
                        <td className="px-5 py-5 text-center text-sm text-gray-600">{row.parcial ?? '—'}</td>
                        <td className="px-5 py-5 text-center text-sm text-gray-600">{row.completa ?? '—'}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="text-sm font-semibold text-gray-700">{row.mensual ?? '—'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-4">
              {rows.map((row) => (
                <div key={row.servicio} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading font-bold text-gray-800 leading-tight">{row.servicio}</h3>
                    <div className="text-right ml-4 flex-shrink-0">
                      {row.hora
                        ? <>
                            <div className="font-bold text-teal-600 text-2xl">{row.hora}</div>
                            <div className="text-xs text-gray-400">por hora</div>
                          </>
                        : <div className="text-xs text-gray-400 italic">A confirmar</div>}
                    </div>
                  </div>
                  {row.hora && (
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1 font-medium">Parcial</div>
                        <div className="font-semibold text-gray-700 text-xs">{row.parcial}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1 font-medium">Completa</div>
                        <div className="font-semibold text-gray-700 text-xs">{row.completa}</div>
                      </div>
                      {row.mensual && (
                        <div className="bg-teal-50 rounded-xl p-3 col-span-2">
                          <div className="text-xs text-teal-600 mb-1 font-medium">Mensual</div>
                          <div className="font-semibold text-gray-700 text-xs">{row.mensual}</div>
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
        <div className="mt-8 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Nota legal:</strong> Cuidado Infantil y Limpieza del Hogar se calculan en tiempo real desde la escala
            salarial oficial de ARCA (ex AFIP) para Personal de Casas Particulares. Las demás categorías no tienen un
            nomenclador nacional único (dependen de cada obra social o colegio profesional) y se muestran &ldquo;a
            confirmar&rdquo; hasta que el equipo cargue una referencia. Los valores reales pueden variar según
            experiencia, certificaciones y acuerdo entre las partes. CUID_AR actúa como plataforma intermediaria y no
            determina los honorarios finales.
          </p>
        </div>
      </div>
    </section>
  )
}
