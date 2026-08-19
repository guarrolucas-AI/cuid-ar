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
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {title ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gray-800 mb-4">{title}</h1>
              <p className="text-gray-600 leading-relaxed">
                Estamos redactando este documento junto a nuestro equipo legal, dado que CUID_AR maneja datos
                sensibles (identidad, domicilio, cuidado de menores) y pagos entre usuarios. Va a estar publicado
                acá antes del lanzamiento definitivo de la plataforma.
              </p>
              <p className="text-gray-500 text-sm mt-6">
                Si tenés una consulta puntual mientras tanto, escribinos a{' '}
                <a href="mailto:hola@cuid-ar.com" className="text-teal-600 font-semibold hover:underline">
                  hola@cuid-ar.com
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-gray-800 mb-4">Documento no encontrado</h1>
              <p className="text-gray-600">No encontramos el documento legal que buscás.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
