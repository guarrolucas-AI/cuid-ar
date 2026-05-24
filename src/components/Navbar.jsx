import { useState } from 'react'
import { Menu, X, Heart } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Aranceles', href: '#aranceles' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-heading font-bold text-xl">
              <span className="text-teal-500">CUID</span>
              <span className="text-gray-700">_AR</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-teal-500 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#registro"
              className="px-5 py-2 bg-teal-500 text-white text-sm font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg"
            >
              Ingresar / Registrarse
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-teal-500 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-gray-600 hover:text-teal-500 py-2.5 border-b border-gray-50"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#registro"
            className="block w-full text-center px-5 py-3 bg-teal-500 text-white text-sm font-semibold rounded-full hover:bg-teal-600 transition-colors mt-3"
            onClick={() => setIsOpen(false)}
          >
            Ingresar / Registrarse
          </a>
        </div>
      )}
    </nav>
  )
}
