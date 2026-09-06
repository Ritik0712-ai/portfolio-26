'use client';

import PageTransition from '@/components/PageTransition';
import Contact from '@/components/Contact';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata({ title: 'Contact', path: '/contact' });

export default function ContactPage() {
  return (
    <PageTransition>
      <Contact />
    </PageTransition>
  );
}
