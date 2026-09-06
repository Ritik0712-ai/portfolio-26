import type { Metadata } from 'next';

// Fallback must be a domain we actually own. `www` is currently canonical:
// Vercel serves apex as a 308 redirect to www. If that flips, change this and
// NEXT_PUBLIC_SITE_URL together.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ritikagarwal.me';
export { siteUrl };
const siteName = 'Ritik Agarwal Portfolio';
const defaultTitle = 'Ritik Agarwal | Product-Minded Engineer';
const defaultDescription =
  'I build dependable products from idea to production. Full-stack engineer focused on clean architecture and thoughtful UX.';

export const defaultMetadata: Metadata = {
  title: {
    default: defaultTitle,
    template: '%s | Ritik Agarwal',
  },
  description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
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
    title: defaultTitle,
    description: defaultDescription,
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

export function pageMetadata({
  title,
  description = defaultDescription,
  path = '/',
  ogImage = '/og-default.png',
  ogImageAlt = 'Ritik Agarwal - Product-Minded Engineer',
  publishedTime,
  modifiedTime,
  type = 'website',
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article';
}): Metadata {
  const canonical = path === '/' ? '/' : path;
  const pageTitle = title
    ? `${title} | Ritik Agarwal`
    : defaultTitle;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `${siteUrl}${path}`,
      siteName,
      locale: 'en_US',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImage],
    },
  };

  return metadata;
}
