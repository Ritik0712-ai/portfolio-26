'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import BlogPreview from '@/components/BlogPreview'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'
import BackToTop from '@/components/BackToTop'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import Timeline from '@/components/Timeline'

// Dynamic import for 3D (avoids SSR issues)
const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-background" />
})

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      <CustomCursor />
      <main className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Hero3D />
        <NavBar />
        <Hero />
        <Stats />
        <About />
        <Timeline />
        <Skills />
        <Projects />
        <Testimonials />
        <BlogPreview />
        <Contact />
        <Footer />
      </main>
      <BackToTop />
    </>
  )
}
