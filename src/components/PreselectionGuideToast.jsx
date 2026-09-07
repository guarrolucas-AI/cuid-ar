import { useState, useEffect } from 'react'
import { Bookmark, ArrowRight, X } from 'lucide-react'

const STORAGE_KEY = 'cuidar_presel_guided'

export function usePreselectionGuide() {
  const [visible, setVisible] = useState(false)

  const trigger = () => {
    if (localStorage.getItem(STORAGE_KEY)) return
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(true)
  }

  const dismiss = () => setVisible(false)

  return { visible, trigger, dismiss }
}

export default function PreselectionGuideToast({ visible, onDismiss, onOpenDrawer }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => onDismiss?.(), 5000)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100vw-3rem)] max-w-sm"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-teal-200 p-5">
        <div className="flex items-start gap-3">
          {/* Ícono */}
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Bookmark className="w-5 h-5 text-teal-600" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-gray-800 text-base leading-tight">
              ¡Perfil guardado en tu Preselección!
            </p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Seguí navegando y guardá hasta 3 profesionales más para compararlos y enviar tus solicitudes.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => { onOpenDrawer?.(); onDismiss?.() }}
                className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Ver preseleccionados <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-gray-300 select-none">·</span>
              <button
                onClick={onDismiss}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Continuar buscando
              </button>
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
