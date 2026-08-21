import { useReveal } from '../hooks/useReveal'
import Nav from '../sections/Nav'
import Hero from '../sections/Hero'
import PainPoints from '../sections/PainPoints'
import Features from '../sections/Features'
import Workflow from '../sections/Workflow'
import Screens from '../sections/Screens'
import Faq from '../sections/Faq'
import Risk from '../sections/Risk'
import Cta from '../sections/Cta'
import Footer from '../sections/Footer'

export default function Home() {
  useReveal()
  return (
    <div className="min-h-screen bg-[#070c18] text-slate-200">
      <Nav />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <Workflow />
        <Screens />
        <Faq />
        <Risk />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
