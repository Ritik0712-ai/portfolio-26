import type { Metadata } from 'next';
import MacDesktop from '@/components/macos/MacDesktop';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ title: 'Magic — RitikOS', path: '/magic' });

export default function MagicPage() {
  return <MacDesktop />;
}
