import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const DOCS = {
  'terminos-y-condiciones': 'Términos y Condiciones',
  'politica-de-privacidad': 'Política de Privacidad',
  'politica-de-datos': 'Política de Uso de Datos',
  'aviso-legal': 'Aviso Legal',
}

export default function LegalPage() {
  const { slug } = useParams()
  const title = DOCS[slug]

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors"
          style={{ color: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="border p-8 sm:p-10" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
          {title ? (
            <>
              <div className="w-12 h-12 flex items-center justify-center mb-6"
                style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--cuidar-verde-institucional)' }} />
              </div>
              <h1 className="font-heading text-2xl font-bold mb-4" style={{ color: 'var(--cuidar-tinta)' }}>
                {title}
              </h1>
              <p className="leading-relaxed" style={{ color: 'var(--cuidar-texto)' }}>
                Estamos redactando este documento junto a nuestro equipo legal, dado que CuidAR 360 maneja datos
                sensibles (identidad, domicilio, cuidado de menores) y pagos entre usuarios. Va a estar publicado
                acá antes del lanzamiento definitivo de la plataforma.
              </p>
              <p className="text-sm mt-6" style={{ color: 'var(--cuidar-gris-medio)' }}>
                Si tenés una consulta puntual mientras tanto, escribinos a{' '}
                <a
                  href="mailto:info@cuidar360.com.ar"
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
                >
                  info@cuidar360.com.ar
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold mb-4" style={{ color: 'var(--cuidar-tinta)' }}>
                Documento no encontrado
              </h1>
              <p style={{ color: 'var(--cuidar-texto)' }}>No encontramos el documento legal que buscás.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
