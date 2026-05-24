import { Info, TrendingUp } from 'lucide-react'

const aranceles = [
  {
    servicio: 'Limpieza del Hogar',
    categoria: 'Casas Particulares Cat. 5',
    hora: '$5.300',
    parcial: '$21.200 (4 hs)',
    completa: '$42.400 (8 hs)',
    mensual: '$650.000 (Con retiro)',
    mensualAlt: '$723.000 (Cama adentro)',
    badgeBg: 'bg-sky-100 text-sky-700',
    rowBg: 'hover:bg-sky-50/40',
  },
  {
    servicio: 'Niñeras / Cuidado Infantil',
    categoria: 'Casas Particulares Cat. 4',
    hora: '$5.900',
    parcial: '$23.600 (4 hs)',
    completa: '$47.200 (8 hs)',
    mensual: '$725.000 (Con retiro)',
    mensualAlt: '$808.000 (Sin retiro)',
    badgeBg: 'bg-teal-100 text-teal-700',
    rowBg: 'hover:bg-teal-50/40',
  },
  {
    servicio: 'Maestras de Apoyo',
    categoria: 'Nomenclador Educativo',
    hora: '$9.500',
    parcial: '$28.500 (módulo 3 hs)',
    completa: '—',
    mensual: '$380.000 (2 hs diarias L–V)',
    mensualAlt: null,
    badgeBg: 'bg-amber-100 text-amber-700',
    rowBg: 'hover:bg-amber-50/40',
  },
  {
    servicio: 'Acompañante Terapéutico (AT)',
    categoria: 'Certificación Profesional',
    hora: '$8.200',
    parcial: '$49.200 (jornada 6 hs)',
    completa: '—',
    mensual: '$984.000 (6 hs diarias L–V)',
    mensualAlt: null,
    badgeBg: 'bg-emerald-100 text-emerald-700',
    rowBg: 'hover:bg-emerald-50/40',
  },
  {
    servicio: 'Enfermeras Pediátricas',
    categoria: 'Nomenclador de Salud Bs.As.',
    hora: '$11.000',
    parcial: '$66.000 (guardia 6 hs)',
    completa: '$132.000 (guardia 12 hs)',
    mensual: '$1.320.000 (Rotativo)',
    mensualAlt: null,
    badgeBg: 'bg-blue-100 text-blue-700',
    rowBg: 'hover:bg-blue-50/40',
  },
]

export default function Aranceles() {
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
            Vigentes Mayo 2026
          </div>
          <p className="text-gray-600 mt-5 max-w-2xl mx-auto text-base">
            Valores sugeridos basados en convenios y nomencladores vigentes. La transparencia en los precios es uno de nuestros pilares fundamentales.
          </p>
        </div>

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
                {aranceles.map((row, i) => (
                  <tr
                    key={row.servicio}
                    className={`border-t border-gray-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${row.rowBg}`}
                  >
                    <td className="px-6 py-5">
                      <div className="font-heading font-bold text-gray-800">{row.servicio}</div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-1.5 inline-block ${row.badgeBg}`}>
                        {row.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <span className="font-bold text-teal-600 text-lg">{row.hora}</span>
                    </td>
                    <td className="px-5 py-5 text-center text-sm text-gray-600">{row.parcial}</td>
                    <td className="px-5 py-5 text-center text-sm text-gray-600">{row.completa}</td>
                    <td className="px-5 py-5 text-center">
                      <div className="text-sm font-semibold text-gray-700">{row.mensual}</div>
                      {row.mensualAlt && (
                        <div className="text-xs text-gray-500 mt-1">{row.mensualAlt}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-4">
          {aranceles.map((row) => (
            <div key={row.servicio} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-bold text-gray-800 leading-tight">{row.servicio}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-1.5 inline-block ${row.badgeBg}`}>
                    {row.categoria}
                  </span>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="font-bold text-teal-600 text-2xl">{row.hora}</div>
                  <div className="text-xs text-gray-400">por hora</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1 font-medium">Parcial</div>
                  <div className="font-semibold text-gray-700 text-xs">{row.parcial}</div>
                </div>
                {row.completa !== '—' && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1 font-medium">Completa</div>
                    <div className="font-semibold text-gray-700 text-xs">{row.completa}</div>
                  </div>
                )}
                <div className={`bg-teal-50 rounded-xl p-3 ${row.completa !== '—' ? '' : 'col-span-2'}`}>
                  <div className="text-xs text-teal-600 mb-1 font-medium">Mensual</div>
                  <div className="font-semibold text-gray-700 text-xs">{row.mensual}</div>
                  {row.mensualAlt && <div className="text-xs text-gray-500 mt-0.5">{row.mensualAlt}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal note */}
        <div className="mt-8 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Nota legal:</strong> Valores informativos basados en convenios vigentes (CNTCP, AFIP, Nomencladores de
            Salud y Colegios Profesionales de Bs.As.). Los valores reales pueden variar según experiencia, certificaciones
            y acuerdo entre las partes. CUID_AR actúa como plataforma intermediaria y no determina los honorarios finales.
          </p>
        </div>
      </div>
    </section>
  )
}
