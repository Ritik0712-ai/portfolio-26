import type { Metadata, Viewport } from 'next';
import AndroidEdition from '@/components/android/AndroidEdition';
import { Roboto } from 'next/font/google';
import { pageMetadata } from '@/lib/metadata';

// Roboto is Apache-2.0 licensed — the only Android-flavoured asset we load.
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto', display: 'swap' });

export const metadata: Metadata = pageMetadata({ title: 'Magic — RitikOS Android Edition', path: '/magic/android' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function AndroidMagicPage() {
  return (
    <div className={roboto.variable}>
      <AndroidEdition />
    </div>
  );
}
