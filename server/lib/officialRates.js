// IMPORTANTE: usar pdf-parse@1.x, no 2.x. La v2 trae pdfjs-dist con soporte
// de renderizado (canvas), que depende de @napi-rs/canvas — un binario
// nativo que no existe en el runtime serverless de Vercel y tira
// `ReferenceError: DOMMatrix is not defined` en el cold start, tumbando
// TODA la función (todas las rutas, no solo esta). La v1 es CJS puro,
// solo extracción de texto, sin esa dependencia.
import pdf from 'pdf-parse'

function pdfUrlFor(year, month) {
  const yy = String(year).slice(-2)
  const mm = String(month).padStart(2, '0')
  return `https://www.afip.gob.ar/casasparticulares/categorias-y-remuneraciones/documentos/${year}/Casas-particulares-remuneraciones-${mm}-${yy}.pdf`
}

// "3.996,45" (formato AR) -> 3996.45
function parseArsNumber(raw) {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.'))
}

async function fetchAndParse(url) {
  const res = await fetch(url)
  if (!res.ok) return null

  const buf = Buffer.from(await res.arrayBuffer())
  const { text } = await pdf(buf)

  // Tabla de "Escala de salarios <mes> <año>" con columnas Con retiro /
  // Sin retiro. Usamos "Con retiro" (jornada, no cama adentro) por hora,
  // que es lo comparable con el modelo de tarifa por hora de CUID_AR.
  const vigenciaMatch  = text.match(/Escala de salarios\s+(\w+)\s+(\d{4})/i)
  const cuidadoMatch   = text.match(/Cuidado de personas\s*\$\s*([\d.,]+)/)
  const generalesMatch = text.match(/Personal para\s*tareas\s*generales\s*\$\s*([\d.,]+)/)

  if (!cuidadoMatch || !generalesMatch) return null

  return {
    vigencia: vigenciaMatch ? `${vigenciaMatch[1]} ${vigenciaMatch[2]}` : null,
    infantil: parseArsNumber(cuidadoMatch[1]),
    limpieza: parseArsNumber(generalesMatch[1]),
    sourceUrl: url,
  }
}

// Busca la escala salarial vigente más reciente de Personal de Casas
// Particulares (fuente: ARCA, ex AFIP — Comisión Nacional de Trabajo en
// Casas Particulares). Es la única de las 5 categorías de CUID_AR con un
// nomenclador nacional único y verificable; las demás (salud,
// terapéutico, pedagógico) dependen de cada obra social o colegio
// profesional y quedan a criterio manual del admin.
//
// Prueba el mes actual y retrocede hasta 6 meses porque la publicación
// del PDF del mes en curso suele tener unos días de demora.
export async function fetchCasasParticularesRates() {
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const url = pdfUrlFor(d.getFullYear(), d.getMonth() + 1)
    const result = await fetchAndParse(url)
    if (result) return result
  }
  throw new Error('No se encontró ninguna escala salarial de ARCA publicada en los últimos 6 meses')
}
