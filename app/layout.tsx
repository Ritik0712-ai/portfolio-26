import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SkipNav from '@/components/SkipNav';
import ScrollProgress from '@/components/ScrollProgress';
import Analytics from '@/components/Analytics';
import StructuredData from '@/components/StructuredData';
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
  title: {
    default: 'Ritik Agarwal | Product-Minded Engineer',
    template: '%s | Ritik Agarwal',
  },
  description:
    'I build dependable products from idea to production. Full-stack engineer focused on clean architecture and thoughtful UX.',
  keywords: [
    'developer',
    'full-stack',
    'portfolio',
    'product engineer',
    'Ritik Agarwal',
    'Next.js',
    'React',
  ],
  authors: [{ name: 'Ritik Agarwal' }],
  creator: 'Ritik Agarwal',
  openGraph: {
    title: 'Ritik Agarwal | Product-Minded Engineer',
    description:
      'I build dependable products from idea to production. Full-stack engineer focused on clean architecture and thoughtful UX.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ritik.dev',
    siteName: 'Ritik Agarwal Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Ritik Agarwal - Product-Minded Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ritik Agarwal | Product-Minded Engineer',
    description: 'I build dependable products from idea to production.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
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
              url: 'https://ritik.dev',
              jobTitle: 'Product Engineer',
              sameAs: [
                'https://github.com/Ritik0712-ai',
                'https://linkedin.com/in/ritikagarwal',
              ],
            }}
          />
          <StructuredData
            type="website"
            data={{
              name: 'Ritik Agarwal Portfolio',
              url: 'https://ritik.dev',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
