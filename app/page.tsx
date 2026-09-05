'use client';

import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import BlogPreview from '@/components/BlogPreview';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import Timeline from '@/components/Timeline';

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
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
  );
}
