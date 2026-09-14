import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Isotipo } from '../lib/Isotipo'

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cuidar-borde" style={{ borderBottomColor: 'var(--cuidar-borde)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <Isotipo size={34} variant="color" />
            <span className="font-heading font-bold text-[1.2rem] tracking-tight leading-none">
              <span style={{ color: 'var(--cuidar-verde-institucional)' }}>CuidAR</span>
              <span style={{ color: 'var(--cuidar-gris-medio)' }}> 360</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--cuidar-gris-medio)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-medio)'}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="px-5 py-2 text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--cuidar-verde-700)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--cuidar-verde-institucional)'}
            >
              Ingresar / Registrarse
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--cuidar-gris-medio)' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-1" style={{ borderColor: 'var(--cuidar-borde)' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium py-2.5 border-b"
              style={{ color: 'var(--cuidar-texto)', borderColor: 'var(--cuidar-borde)' }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="block w-full text-center px-5 py-3 text-white text-sm font-semibold mt-3"
            style={{ backgroundColor: 'var(--cuidar-verde-institucional)' }}
            onClick={() => setIsOpen(false)}
          >
            Ingresar / Registrarse
          </a>
        </div>
      )}
    </nav>
  )
}
