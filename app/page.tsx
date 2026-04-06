import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Hero from '@/components/sections/Hero'
import Profile from '@/components/sections/Profile'
import Exploded from '@/components/sections/Exploded'
import Stats from '@/components/sections/Stats'
import Models from '@/components/sections/Models'
import CTA from '@/components/sections/CTA'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Profile />
      <Exploded />
      <Stats />
      <Models />
      <CTA />
      <Footer />
    </main>
  )
}
