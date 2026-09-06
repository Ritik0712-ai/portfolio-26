import { siteUrl } from '@/lib/metadata';

interface StructuredDataProps {
  type: 'person' | 'blog' | 'website';
  data: Record<string, unknown>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getSchema = () => {
    switch (type) {
      case 'person':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.name || 'Ritik Agarwal',
          url: data.url || siteUrl,
          jobTitle: data.jobTitle || 'Product Engineer',
          description: data.description || 'Full-stack engineer focused on clean architecture and thoughtful UX.',
          sameAs: data.sameAs || [],
        };
      case 'blog':
        return {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: data.title,
          description: data.excerpt,
          datePublished: data.date,
          dateModified: data.date,
          author: {
            '@type': 'Person',
            name: data.author || 'Ritik Agarwal',
          },
          url: data.url,
          image: data.cover_image ? [data.cover_image] : [],
        };
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'Ritik Agarwal',
          url: data.url || siteUrl,
          description: data.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };
      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
