import { Baby, GraduationCap, Stethoscope, Users, Sparkles } from 'lucide-react'

const services = [
  {
    icon: Baby,
    title: 'Cuidado Infantil',
    subtitle: 'Niñeras Profesionales',
    desc: 'Niñeras certificadas con formación en primeros auxilios, desarrollo infantil y pedagogía lúdica. Cuidado amoroso y responsable para bebés y niños.',
    badge: 'Casas Particulares Cat. 4',
    gradient: 'from-teal-400 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    text: 'text-teal-600',
    badgeBg: 'bg-teal-100 text-teal-700',
  },
  {
    icon: GraduationCap,
    title: 'Apoyo Pedagógico',
    subtitle: 'Maestras de Apoyo',
    desc: 'Docentes especializadas en refuerzo escolar y aprendizaje personalizado. Acompañamiento educativo adaptado al ritmo de cada alumno.',
    badge: 'Nomenclador Educativo',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Stethoscope,
    title: 'Salud Pediátrica',
    subtitle: 'Enfermeras Pediátricas',
    desc: 'Enfermeras matriculadas con especialización pediátrica para guardias domiciliarias, tratamientos y seguimiento médico en el hogar.',
    badge: 'Nomenclador de Salud Bs.As.',
    gradient: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Users,
    title: 'Cuidado Terapéutico',
    subtitle: 'Acompañantes Terapéuticos (AT)',
    desc: 'Profesionales AT registrados para acompañamiento de personas con necesidades especiales, trastornos del desarrollo e integración social.',
    badge: 'Certificación AT',
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'Limpieza del Hogar',
    subtitle: 'Personal Doméstico',
    desc: 'Personal de limpieza registrado y profesionalizado. Trabajo responsable, productos certificados y total respeto por tu hogar.',
    badge: 'Casas Particulares Cat. 5',
    gradient: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    text: 'text-sky-600',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
]

export default function Servicios() {
  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-teal-500 font-semibold text-sm uppercase tracking-widest">Nuestros Módulos</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-gray-800 mt-3 mb-6">
            Servicios de <span className="text-teal-500">Cuidado Integral</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cinco módulos especializados que cubren todas las necesidades de cuidado del hogar con estándares profesionales.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                className={`rounded-3xl border-2 ${s.border} ${s.bg} p-8 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 ${s.badgeBg}`}>
                  {s.badge}
                </span>
                <h3 className="font-heading font-bold text-xl text-gray-800 mb-1">{s.title}</h3>
                <p className={`text-sm font-semibold ${s.text} mb-3`}>{s.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                <button className={`mt-5 text-sm font-semibold ${s.text} hover:underline flex items-center gap-1`}>
                  Ver profesionales →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
