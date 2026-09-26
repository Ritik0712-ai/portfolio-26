import type { Metadata } from 'next';
import InstallRegistrar from '@/components/os/InstallRegistrar';

// Every /magic page is part of the installable RitikOS app.
export const metadata: Metadata = {
  manifest: '/ritikos.webmanifest',
  appleWebApp: { capable: true, title: 'RitikOS', statusBarStyle: 'black-translucent' },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export default function MagicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallRegistrar />
    </>
  );
}
