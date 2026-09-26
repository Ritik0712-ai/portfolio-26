import { NextResponse } from 'next/server';
import { getGitHubActivity, getLeetCodeStats } from '@/lib/activity';

// Rebuilt at most once a minute.
export const revalidate = 60;

export async function GET() {
  const [github, leetcode] = await Promise.all([getGitHubActivity(), getLeetCodeStats()]);
  return NextResponse.json(
    { github, leetcode },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
