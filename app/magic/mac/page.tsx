import type { Metadata, Viewport } from 'next';
import RitikOS from '@/components/os/RitikOS';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ title: 'Magic — RitikOS Mac Edition', path: '/magic/mac' });

// Edge-to-edge on phones so the status bar and home indicator sit in the
// safe areas like a native app. Pinch-zoom stays enabled for accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function MacMagicPage() {
  return <RitikOS />;
}
