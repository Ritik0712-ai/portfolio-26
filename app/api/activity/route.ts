import { NextResponse } from 'next/server';
import { getGitHubActivity, getLeetCodeStats } from '@/lib/activity';

export const revalidate = 1800;

export async function GET() {
  const [github, leetcode] = await Promise.all([getGitHubActivity(), getLeetCodeStats()]);
  return NextResponse.json(
    { github, leetcode },
    { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
  );
}
