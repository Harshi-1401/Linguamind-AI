import BackgroundEffects from '../../components/BackgroundEffects'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero'
import Features from '../../components/Features'
import Stats from '../../components/Stats'
import Testimonials from '../../components/Testimonials'
import CTA from '../../components/CTA'
import Footer from '../../components/Footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen font-sans">
      <BackgroundEffects />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Stats />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}
