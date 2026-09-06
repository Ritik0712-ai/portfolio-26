import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

// The page below is a client component, and Next.js disallows exporting
// metadata from one. It lives here in the server layout instead.
export const metadata: Metadata = pageMetadata({ title: 'Contact', path: '/contact' });

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
