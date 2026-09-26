import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createHash } from 'crypto';
import { getBlogBySlug } from '@/lib/public-data';
import { geminiEnabled, geminiGenerate } from '@/lib/gemini';

// AI "TL;DR" for a blog post, in English or Hindi. Generated once per
// (post, language, content version) and kept in Next's data cache, so the
// free Gemini quota is spent only when a post is new or edited.

interface Summary {
  points: string[];
  takeaway: string;
}

const LANG_NAME = { en: 'English', hi: 'Hindi (Devanagari script; keep technical terms in English)' } as const;

async function generate(slug: string, lang: 'en' | 'hi', title: string, content: string): Promise<Summary> {
  const text = await geminiGenerate({
    system:
      'You summarise blog posts for readers who are deciding whether to read them. Be faithful to the post: never add facts, opinions or advice that are not in it. Plain language, no hype, no emojis.',
    prompt: `Summarise this post in ${LANG_NAME[lang]}.
Return JSON: {"points": [3 short bullet points, max 22 words each], "takeaway": "one sentence, max 25 words"}.

Title: ${title}

${content.slice(0, 24000)}`,
    maxOutputTokens: 700,
    temperature: 0.2,
    json: true,
  });
  const parsed = JSON.parse(text.replace(/^```json\s*|```$/g, '')) as Partial<Summary>;
  const points = (parsed.points ?? []).filter((p) => typeof p === 'string' && p.trim()).slice(0, 4);
  if (!points.length) throw new Error(`Empty summary for ${slug}`);
  return { points, takeaway: typeof parsed.takeaway === 'string' ? parsed.takeaway : '' };
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') ?? '';
  const lang = request.nextUrl.searchParams.get('lang') === 'hi' ? 'hi' : 'en';
  if (!slug || slug.length > 200) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  if (!geminiEnabled()) return NextResponse.json({ enabled: false });

  const post = await getBlogBySlug(slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const version = createHash('sha1').update(`${post.title}\n${post.content}`).digest('hex').slice(0, 12);
  try {
    const summary = await unstable_cache(
      () => generate(slug, lang, post.title, post.content),
      ['blog-summary-v1', slug, lang, version],
      { revalidate: false, tags: [`blog-summary:${slug}`] },
    )();
    return NextResponse.json(
      { enabled: true, lang, ...summary },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch (err) {
    console.error('Blog summary failed', err);
    return NextResponse.json({ enabled: true, error: 'Summary unavailable right now' }, { status: 503 });
  }
}
