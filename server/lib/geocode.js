// Geocodifica una dirección a { lat, lng }.
//
// La especificación pide Google Maps API, pero no hay ninguna API key de
// Google configurada en este proyecto (revisado: no está en .env ni en
// AppConfig). En vez de bloquear el feature hasta que exista esa cuenta,
// se usa Nominatim (OpenStreetMap) — es gratuito, no pide API key, y
// alcanza sobradamente para el volumen de geocodificar altas de usuarios
// (no búsquedas en caliente). Si más adelante consiguen una key de Google
// Maps, el cambio es acotado: reemplazar el fetch de acá por el de
// Geocoding API, la firma de geocodeAddress() no cambia.
//
// Límite de uso de Nominatim: 1 request/segundo, requiere un header
// User-Agent identificable. Para volumen alto de producción, considerar
// self-host de Nominatim o pasar a Google/Mapbox.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null
  try {
    const params = new URLSearchParams({
      q: `${address}, Argentina`,
      format: 'json',
      limit: '1',
    })
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': 'CUID_AR/1.0 (hola@cuid-ar.com)' },
    })
    if (!res.ok) return null
    const results = await res.json()
    if (!results.length) return null
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
  } catch (err) {
    console.error('[geocode] error:', err.message)
    return null
  }
}
