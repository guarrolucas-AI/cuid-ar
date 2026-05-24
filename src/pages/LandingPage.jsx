import Navbar from '../components/Navbar'
import HeroCarousel from '../components/HeroCarousel'
import Nosotros from '../components/Nosotros'
import Servicios from '../components/Servicios'
import Aranceles from '../components/Aranceles'
import CapturaLeads from '../components/CapturaLeads'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroCarousel />
        <Nosotros />
        <Servicios />
        <Aranceles />
        <CapturaLeads />
      </main>
      <Footer />
    </div>
  )
}
