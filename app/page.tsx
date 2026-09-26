import Hero from '@/components/Hero';
import NowBento from '@/components/NowBento';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Testimonials from '@/components/Testimonials';
import BlogPreview from '@/components/BlogPreview';
import Contact from '@/components/Contact';
import NewsletterSignup from '@/components/NewsletterSignup';
import BackToTop from '@/components/BackToTop';
import { getBlogs, getCertifications, getProjects, getTestimonials, getTimeline } from '@/lib/public-data';

// Content is rendered on the server (so crawlers and link previews see it)
// and regenerated at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const [projects, events, certifications, testimonials, posts] = await Promise.all([
    getProjects(true),
    getTimeline(),
    getCertifications(),
    getTestimonials(),
    getBlogs(3),
  ]);

  return (
    <>
      <main id="main-content" className="min-h-screen">
        <Hero />
        <NowBento />
        <About />
        <Skills />
        <Projects projects={projects} />
        <Experience events={events} certifications={certifications} />
        <Testimonials testimonials={testimonials} />
        <BlogPreview posts={posts} />
        <Contact />
        <section aria-labelledby="newsletter-heading" className="pb-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="border-t border-border pt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 id="newsletter-heading" className="text-2xl font-display font-semibold text-text-primary">
                  Get new posts by email
                </h2>
                <p className="text-sm text-text-muted font-body mt-1">
                  Occasional notes on building products. No spam, unsubscribe anytime.
                </p>
              </div>
              <NewsletterSignup variant="compact" />
            </div>
          </div>
        </section>
      </main>
      <BackToTop />
    </>
  );
}
