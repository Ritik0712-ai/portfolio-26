import { NextResponse } from 'next/server';
import { getGitHubOverview } from '@/lib/github';

// Always runs (no ISR copy that can go stale at the edge); the GitHub call
// itself is cached for 45s in lib/github.ts. Browsers never cache it.
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getGitHubOverview();
  if (!data) {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' },
  });
}
