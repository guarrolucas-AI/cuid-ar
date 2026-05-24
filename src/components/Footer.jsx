import { Heart, Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const servicios = [
  { label: 'Cuidado Infantil', href: '#servicios' },
  { label: 'Apoyo Pedagógico', href: '#servicios' },
  { label: 'Salud Pediátrica', href: '#servicios' },
  { label: 'Cuidado Terapéutico', href: '#servicios' },
  { label: 'Limpieza del Hogar', href: '#servicios' },
]

const empresa = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Aranceles', href: '#aranceles' },
  { label: 'Registro de Profesionales', href: '#registro' },
  { label: 'Buscar un Profesional', href: '#registro' },
]

const legal = [
  { label: 'Términos y Condiciones', href: '#' },
  { label: 'Política de Privacidad', href: '#' },
  { label: 'Política de Uso de Datos', href: '#' },
  { label: 'Aviso Legal', href: '#' },
]

export default function Footer() {
  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#inicio" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-heading font-bold text-xl">
                <span className="text-teal-400">CUID</span>
                <span className="text-white">_AR</span>
              </span>
            </a>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs mb-6">
              Red profesionalizada y legal regulada de cuidado integral para el hogar en Buenos Aires. CABA y GBA.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Servicios</h4>
            <ul className="space-y-2.5">
              {servicios.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {empresa.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto + Legal */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                Buenos Aires, Argentina
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <a href="mailto:hola@cuid-ar.com" className="text-gray-400 hover:text-teal-400 transition-colors">
                  hola@cuid-ar.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <a href="tel:+541100000000" className="text-gray-400 hover:text-teal-400 transition-colors">
                  +54 11 0000-0000
                </a>
              </li>
            </ul>
            <h4 className="font-heading font-semibold text-white mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              {legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© 2026 CUID_AR. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            Hecho con <Heart className="w-3 h-3 text-teal-500 fill-teal-500" /> en Buenos Aires
          </p>
        </div>
      </div>
    </footer>
  )
}
