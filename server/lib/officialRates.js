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

// "3.996,45" o, por un artefacto de espaciado del PDF, "5 05.302,76"
// (formato AR: "." separador de miles, "," decimal) -> número.
function parseArsNumber(raw) {
  const clean = raw.replace(/\s/g, '')
  const lastComma = clean.lastIndexOf(',')
  if (lastComma === -1) return parseFloat(clean.replace(/\./g, ''))
  return parseFloat(`${clean.slice(0, lastComma).replace(/\./g, '')}.${clean.slice(lastComma + 1)}`)
}

// Extrae los montos en $ que siguen a `label` dentro de `norm` (texto ya
// normalizado, espacios colapsados), hasta el próximo separador conocido.
// Cada fila de la tabla trae 4 montos: hora con/sin retiro, mes con/sin
// retiro — en ese orden.
function extractAmounts(norm, label, stopAt) {
  const start = norm.indexOf(label)
  if (start === -1) return null
  const from = start + label.length
  const to = stopAt ? norm.indexOf(stopAt, from) : -1
  const chunk = norm.slice(from, to === -1 ? norm.length : to)
  return [...chunk.matchAll(/\$\s*(-|[\d.,\s]+?)(?=\s*(?:\$|[A-Za-zÁÉÍÓÚÑáéíóúñ]|$))/g)]
    .map((m) => (m[1] === '-' ? null : parseArsNumber(m[1])))
}

async function fetchAndParse(url) {
  const res = await fetch(url)
  if (!res.ok) return null

  const buf = Buffer.from(await res.arrayBuffer())
  const { text } = await pdf(buf)
  // El extractor de texto del PDF corta líneas de forma irregular según
  // cómo esté maquetada la tabla — normalizamos todo a espacios simples
  // para no depender de esos saltos.
  const norm = text.replace(/\s+/g, ' ')

  const vigenciaMatch = norm.match(/Escala de salarios\s+(\w+)\s+(\d{4})/i)

  // [horaConRetiro, horaSinRetiro, mesConRetiro, mesSinRetiro]
  const cuidado   = extractAmounts(norm, 'Cuidado de personas', 'Personal para tareas generales')
  const generales = extractAmounts(norm, 'Personal para tareas generales', 'El personal que efectúe')

  if (!cuidado?.[0] || !generales?.[0]) return null

  return {
    vigencia: vigenciaMatch ? `${vigenciaMatch[1]} ${vigenciaMatch[2]}` : null,
    infantil: cuidado[0],
    infantilMensual: cuidado[2] ?? null,
    limpieza: generales[0],
    limpiezaMensual: generales[2] ?? null,
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
