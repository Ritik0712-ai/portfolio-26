import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SkipNav from '@/components/SkipNav';
import ScrollProgress from '@/components/ScrollProgress';
import Analytics from '@/components/Analytics';
import StructuredData from '@/components/StructuredData';
import { defaultMetadata, siteUrl } from '@/lib/metadata';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  ...defaultMetadata,
  openGraph: {
    ...defaultMetadata.openGraph!,
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        <SkipNav />
        <ThemeProvider>
          {children}
          <ScrollProgress />
          <Analytics />
          <StructuredData
            type="person"
            data={{
              name: 'Ritik Agarwal',
              url: siteUrl,
              jobTitle: 'Product Engineer',
              sameAs: [
                'https://github.com/Ritik0712-ai',
                'https://www.linkedin.com/in/ritik-agarwal-58ba012b4/',
              ],
            }}
          />
          <StructuredData
            type="website"
            data={{
              name: 'Ritik Agarwal Portfolio',
              url: siteUrl,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
