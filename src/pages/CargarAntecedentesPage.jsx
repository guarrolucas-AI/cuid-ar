import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, FileText, Mail, Instagram, Facebook } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function CargarAntecedentesPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Solo se acepta PDF'); return }
    if (file.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB'); return }
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('certificate', file)
      const res = await fetch(`${API_BASE}/api/professional/certificate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      if (refreshUser) await refreshUser()
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--cuidar-nieve)' }}>
        <div className="w-full max-w-md text-center p-8" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--cuidar-verde-institucional)' }}>
            Certificado recibido
          </h1>
          <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
            El equipo de CuidAR 360 revisará tu certificado. Te avisaremos por email cuando esté aprobado.
            Mientras tanto, tu cuenta está en revisión.
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="w-full py-3 text-sm font-semibold"
            style={{ background: 'var(--cuidar-verde-institucional)', color: '#fff' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--cuidar-nieve)' }}>

      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cuidar-verde-institucional)' }}>
          CUID_AR
        </span>
        <span className="ml-1 text-xs font-medium opacity-60">360</span>
      </div>

      <div className="w-full max-w-md p-8" style={{ border: '2px solid #EF4444', background: '#fff' }}>
        {/* Alerta */}
        <div className="flex items-start gap-3 mb-6 p-4" style={{ background: '#FEF2F2', border: '1px solid #EF4444' }}>
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-sm" style={{ color: '#991B1B' }}>Tu cuenta está suspendida</p>
            <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
              Venció el plazo de 5 días para presentar el Certificado de Antecedentes Penales.
              Subilo para reactivar tu cuenta.
            </p>
          </div>
        </div>

        <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--cuidar-verde-institucional)' }}>
          Subir Certificado de Antecedentes Penales
        </h1>
        <p className="text-xs mb-6" style={{ color: '#6b7280' }}>
          Podés obtenerlo de forma gratuita en el Registro Nacional de Reincidencia (MJ de la Nación)
          en{' '}
          <a href="https://www.argentina.gob.ar/justicia/reincidencia/trámites/solicitar-certificado"
            target="_blank" rel="noreferrer"
            style={{ color: 'var(--cuidar-verde-institucional)', textDecoration: 'underline' }}>
            argentina.gob.ar
          </a>.
        </p>

        {/* Instrucciones */}
        <div className="mb-6 space-y-2">
          {[
            'El archivo debe ser PDF (máx. 5 MB)',
            'Debe ser el documento oficial del Registro Nacional de Reincidencia',
            'Tiene que estar a tu nombre y ser reciente',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#374151' }}>
              <span className="font-bold mt-0.5" style={{ color: 'var(--cuidar-verde-institucional)' }}>
                {i + 1}.
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Upload */}
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
          className="w-full py-4 flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
          style={{ background: 'var(--cuidar-verde-institucional)', color: '#fff' }}>
          {uploading
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando…</>
            : <><FileText className="w-4 h-4" /> Seleccionar PDF</>}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />

        {error && (
          <p className="mt-3 text-xs text-center" style={{ color: '#dc2626' }}>{error}</p>
        )}

        {/* Soporte */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold mb-3 text-center" style={{ color: '#6b7280' }}>
            ¿Necesitás ayuda?
          </p>
          <div className="flex flex-col gap-2">
            <a href="mailto:info@cuidar360.com.ar"
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--cuidar-verde-institucional)' }}>
              <Mail className="w-4 h-4" /> info@cuidar360.com.ar
            </a>
            <a href="https://www.instagram.com/cuidar360.oficial/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--cuidar-verde-institucional)' }}>
              <Instagram className="w-4 h-4" /> @cuidar360.oficial
            </a>
            <a href="https://www.facebook.com/share/19Uq2T2ZcK/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--cuidar-verde-institucional)' }}>
              <Facebook className="w-4 h-4" /> CuidAR 360
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
