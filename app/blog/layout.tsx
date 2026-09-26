import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

// Metadata for the list page. The list itself is a client component
// (search and filters) fed with server-fetched data by page.tsx.
export const metadata: Metadata = pageMetadata({ title: 'Notes & Reflections', path: '/blog' });

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
