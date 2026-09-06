'use client';

import PageTransition from '@/components/PageTransition';
import About from '@/components/About';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata({ title: 'About', path: '/about' });

export default function AboutPage() {
  return (
    <PageTransition>
      <About />
    </PageTransition>
  );
}
