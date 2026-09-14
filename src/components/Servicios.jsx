import { Link } from 'react-router-dom'
import { IconInfantil, IconPedagogico, IconSalud, IconTerapeutico, IconLimpieza } from '../lib/serviceIcons'

const services = [
  {
    category: 'infantil',
    Icon: IconInfantil,
    title: 'Cuidado Infantil',
    subtitle: 'Niñeras Profesionales',
    desc: 'Niñeras certificadas con formación en primeros auxilios, desarrollo infantil y pedagogía lúdica. Cuidado amoroso y responsable para bebés y niños.',
    badge: 'Casas Particulares Cat. 4',
  },
  {
    category: 'pedagogico',
    Icon: IconPedagogico,
    title: 'Apoyo Pedagógico',
    subtitle: 'Maestras de Apoyo',
    desc: 'Docentes especializadas en refuerzo escolar y aprendizaje personalizado. Acompañamiento educativo adaptado al ritmo de cada alumno.',
    badge: 'Nomenclador Educativo',
  },
  {
    category: 'salud',
    Icon: IconSalud,
    title: 'Salud Pediátrica',
    subtitle: 'Enfermeras Pediátricas',
    desc: 'Enfermeras matriculadas con especialización pediátrica para guardias domiciliarias, tratamientos y seguimiento médico en el hogar.',
    badge: 'Nomenclador de Salud Bs.As.',
  },
  {
    category: 'terapeutico',
    Icon: IconTerapeutico,
    title: 'Cuidado Terapéutico',
    subtitle: 'Acompañantes Terapéuticos (AT)',
    desc: 'Profesionales AT registrados para acompañamiento de personas con necesidades especiales, trastornos del desarrollo e integración social.',
    badge: 'Certificación AT',
  },
  {
    category: 'limpieza',
    Icon: IconLimpieza,
    title: 'Limpieza del Hogar',
    subtitle: 'Personal Doméstico',
    desc: 'Personal de limpieza registrado y profesionalizado. Trabajo responsable, productos certificados y total respeto por tu hogar.',
    badge: 'Casas Particulares Cat. 5',
  },
]

export default function Servicios() {
  return (
    <section id="servicios" className="py-24" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="block text-xs font-semibold uppercase mb-3"
            style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
            Nuestros Módulos
          </span>
          <h2 className="font-heading font-bold mt-1 mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--cuidar-tinta)', letterSpacing: '-0.015em' }}>
            Servicios de Cuidado Integral
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--cuidar-gris-medio)', fontSize: '15.5px' }}>
            Cinco módulos especializados que cubren todas las necesidades de cuidado del hogar con estándares profesionales.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const { Icon } = s
            return (
              <div
                key={s.title}
                className={`border p-8 transition-colors duration-200 ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-5"
                  style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-verde-institucional)' }}>
                  <Icon size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 inline-block mb-3"
                  style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-suave)', border: '1px solid var(--cuidar-borde)', letterSpacing: '0.06em' }}>
                  {s.badge}
                </span>
                <h3 className="font-heading font-semibold text-lg mb-1" style={{ color: 'var(--cuidar-tinta)' }}>{s.title}</h3>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--cuidar-verde-institucional)' }}>{s.subtitle}</p>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--cuidar-texto)' }}>{s.desc}</p>
                <Link
                  to={`/buscar?category=${s.category}`}
                  className="text-sm font-semibold transition-colors"
                  style={{ color: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
                >
                  Ver profesionales →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
