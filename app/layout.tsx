import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SkipNav from '@/components/SkipNav';
import ScrollProgress from '@/components/ScrollProgress';
import Analytics from '@/components/Analytics';
import StructuredData from '@/components/StructuredData';
import CommandPalette from '@/components/CommandPalette';
import AskAI from '@/components/AskAI';
import MotionProvider from '@/components/MotionProvider';
import SiteChrome from '@/components/SiteChrome';
import VisitorTracker from '@/components/VisitorTracker';
import { LanguageProvider, LANG_BOOT_SCRIPT } from '@/lib/i18n';
import { ViewTransitionsListener } from '@/components/TransitionLink';
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

// Only downloaded when Hindi text is on screen (the font CSS uses unicode-range).
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: false,
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
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
      className={`${dmSans.variable} ${cormorant.variable} ${jetbrains.variable} ${devanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Apply the saved language before first paint (no flash, pages stay static). */}
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        <SkipNav />
        <ThemeProvider>
          <LanguageProvider>
          <MotionProvider>
            <SiteChrome>{children}</SiteChrome>
          </MotionProvider>
          <ViewTransitionsListener />
          <ScrollProgress />
          <CommandPalette />
          <AskAI />
          <Analytics />
          <VisitorTracker />
          <StructuredData
            type="person"
            data={{
              name: 'Ritik Agarwal',
              url: siteUrl,
              jobTitle: 'Full-Stack Developer',
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
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
