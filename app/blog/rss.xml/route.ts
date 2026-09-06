import { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/metadata';

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const baseUrl = siteUrl
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ritik Agarwal</title>
    <description>Product engineering, full-stack development, and open source.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en</language>`

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: posts } = await supabase
      .from('blogs')
      .select('slug, title, excerpt, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (posts && posts.length > 0) {
      for (const post of posts) {
        const postUrl = `${baseUrl}/blog/${post.slug}`
        const date = new Date(post.updated_at || post.created_at).toUTCString()
        const description = post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 200) || ''
        rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${date}</pubDate>
    </item>`
      }
    }
  } catch {
    // Proceed with empty feed on Supabase errors
  }

  rss += `
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
