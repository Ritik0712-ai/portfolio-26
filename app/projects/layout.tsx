import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

// Metadata for the list page. The list itself is a client component
// (search and filters) fed with server-fetched data by page.tsx.
export const metadata: Metadata = pageMetadata({ title: 'Projects', path: '/projects' });

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
