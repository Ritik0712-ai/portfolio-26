import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Receives anonymous events from lib/track.ts. Stores no IP address and no
// user agent — only a coarse device class and the country code Vercel
// derives at the edge.

const schema = z.object({
  type: z.enum(['pageview', 'scroll', 'project', 'post', 'edition', 'dsa']),
  session_id: z.string().min(8).max(40),
  path: z.string().min(1).max(200),
  source: z.string().max(40).optional(),
  label: z.string().max(120).optional(),
  value: z.number().int().min(0).max(100000).optional(),
});

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime/i;

// Light per-instance throttle: at most 120 events per session per 10 min.
const seen = new Map<string, { n: number; t: number }>();
function throttled(id: string) {
  const now = Date.now();
  const e = seen.get(id);
  if (!e || now - e.t > 600_000) {
    seen.set(id, { n: 1, t: now });
    if (seen.size > 5000) seen.clear();
    return false;
  }
  e.n += 1;
  return e.n > 120;
}

function device(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(JSON.parse(await request.text()));
  } catch {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }
  if (body.path.startsWith('/admin') || throttled(body.session_id)) return new NextResponse(null, { status: 204 });

  const country = request.headers.get('x-vercel-ip-country');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from('page_events').insert({
    type: body.type,
    session_id: body.session_id,
    path: body.path,
    source: body.source ?? null,
    label: body.label ?? null,
    value: body.value ?? null,
    device: device(ua),
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
  });
  if (error) console.error('track insert failed', error.message);
  return new NextResponse(null, { status: 204 });
}
