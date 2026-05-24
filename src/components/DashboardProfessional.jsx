import { useState } from 'react'
import { ShieldCheck, ShieldX, ToggleLeft, ToggleRight, DollarSign, Save } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORY_LABELS = {
  infantil: 'Cuidado Infantil',
  pedagogico: 'Apoyo Pedagógico',
  salud: 'Salud Pediátrica',
  terapeutico: 'Cuidado Terapéutico',
  limpieza: 'Limpieza del Hogar',
}

export default function DashboardProfessional({ user, professional: initialPro }) {
  const [pro, setPro] = useState(initialPro)
  const [rate, setRate] = useState(String(initialPro.hourlyRate))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const patch = async (body) => {
    const res = await fetch(`${API_BASE}/api/professional/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  const toggleAvailable = async () => {
    const next = !pro.available
    setPro((p) => ({ ...p, available: next }))
    await patch({ available: next })
  }

  const saveRate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const updated = await patch({ hourlyRate: parseFloat(rate) })
    setPro((p) => ({ ...p, hourlyRate: updated.hourlyRate }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">

      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-800">{pro.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <span className="mt-2 inline-block text-xs font-semibold bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
            {CATEGORY_LABELS[pro.category] ?? pro.category}
          </span>
        </div>

        {/* Badge verificación */}
        {pro.verified ? (
          <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full border border-teal-200 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold">Verificado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-200 flex-shrink-0">
            <ShieldX className="w-5 h-5" />
            <span className="text-sm font-semibold">Pendiente de verificación</span>
          </div>
        )}
      </div>

      {/* Toggle disponibilidad */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-heading font-bold text-gray-800 mb-4">Disponibilidad</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {pro.available ? 'Estoy disponible para nuevas consultas' : 'No estoy disponible en este momento'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {pro.available
                ? 'Las familias pueden encontrarte en los resultados de búsqueda'
                : 'No aparecés en ninguna búsqueda hasta que volvás a activarte'}
            </p>
          </div>
          <button
            onClick={toggleAvailable}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all flex-shrink-0 ${
              pro.available
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {pro.available
              ? <><ToggleRight className="w-5 h-5" /> Activo</>
              : <><ToggleLeft className="w-5 h-5" /> Inactivo</>}
          </button>
        </div>
      </div>

      {/* Tarifa horaria */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-heading font-bold text-gray-800 mb-1">Tarifa por hora</h3>
        <p className="text-xs text-gray-400 mb-4">
          Tarifa actual: <span className="font-semibold text-teal-600">${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr</span>
        </p>
        <form onSubmit={saveRate} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min="0"
              step="100"
              required
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Ej: 5900"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition-colors text-sm flex-shrink-0 ${
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
