import type { Metadata, Viewport } from 'next';
import WindowsEdition from '@/components/windows/WindowsEdition';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ title: 'Magic — RitikOS Fluent Edition', path: '/magic/windows' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function WindowsMagicPage() {
  return <WindowsEdition />;
}
