// 这是首页
import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import Workflow from '@/components/home/Workflow'
import CTA from '@/components/home/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
      <div>
        {/*<Header />*/}
        <Hero />
        <Features />
        <Workflow />
        <CTA />
        <Footer />
      </div>
  )
}