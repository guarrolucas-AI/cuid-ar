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
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100vw-3rem)] max-w-sm"
      style={{ transform: 'translateX(-50%)' }}>
      <div className="border-2 p-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-verde-institucional)', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
        <div className="flex items-start gap-3">
          {/* Ícono */}
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
            <Bookmark className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-base leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>
              ¡Perfil guardado en tu Preselección!
            </p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--cuidar-gris-medio)' }}>
              Seguí navegando y guardá hasta 3 profesionales más para compararlos.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => { onOpenDrawer?.(); onDismiss?.() }}
                className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{ color: 'var(--cuidar-verde-institucional)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
                Ver preseleccionados <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span style={{ color: 'var(--cuidar-borde)' }}>·</span>
              <button onClick={onDismiss}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--cuidar-gris-suave)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-tinta)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
                Continuar buscando
              </button>
            </div>
          </div>

          {/* Cerrar */}
          <button onClick={onDismiss} className="p-1 flex-shrink-0 transition-colors"
            style={{ color: 'var(--cuidar-gris-suave)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
