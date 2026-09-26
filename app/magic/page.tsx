import type { Metadata, Viewport } from 'next';
import EditionPicker from '@/components/os/EditionPicker';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Magic — RitikOS',
  description: 'Explore Ritik Agarwal’s portfolio as a Mac, Windows or Android-style operating system.',
  path: '/magic',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121016',
};

export default function MagicPage() {
  return <EditionPicker />;
}
