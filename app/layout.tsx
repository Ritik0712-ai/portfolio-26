import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Analytics from '@/components/Analytics'

export const metadata: Metadata = {
  title: 'Ritik Agarwal | Developer & Builder',
  description: 'Building products that solve problems I actually have. CS student at VIT Bhopal, building full-stack applications.',
  keywords: ['developer', 'full-stack', 'portfolio', 'VIT Bhopal', 'React', 'Next.js', 'Ritik Agarwal'],
  authors: [{ name: 'Ritik Agarwal' }],
  creator: 'Ritik Agarwal',
  openGraph: {
    title: 'Ritik Agarwal | Developer & Builder',
    description: 'Building products that solve problems I actually have. CS student at VIT Bhopal.',
    url: 'https://ritikagarwal.dev',
    siteName: 'Ritik Agarwal Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Ritik Agarwal Portfolio',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ritik Agarwal | Developer & Builder',
    description: 'Building products that solve problems I actually have.',
    creator: '@RitikAgarwal07',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="bg-background text-text-primary antialiased">
        <ThemeProvider>
          {children}
        <Analytics />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
