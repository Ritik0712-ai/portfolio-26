import { NextResponse } from 'next/server';
import { getGitHubOverview } from '@/lib/github';

// Regenerated at most once a minute; visitors in between get the cached copy.
export const revalidate = 60;

export async function GET() {
  const data = await getGitHubOverview();
  if (!data) {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 502 });
  }
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
