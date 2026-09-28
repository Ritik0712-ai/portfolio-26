import { NextResponse } from 'next/server';
import { getGitHubActivity, getLeetCodeStats } from '@/lib/activity';

// Always runs; the upstream GitHub/LeetCode calls are cached ~60s in lib/activity.
export const dynamic = 'force-dynamic';

export async function GET() {
  const [github, leetcode] = await Promise.all([getGitHubActivity(), getLeetCodeStats()]);
  return NextResponse.json(
    { github, leetcode },
    { headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' } }
  );
}
