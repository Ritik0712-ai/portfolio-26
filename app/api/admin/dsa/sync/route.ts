import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { recentSolves } from '@/lib/leetcode';

// Imports recently accepted LeetCode problems as unpublished drafts, so the
// only manual work left is writing the approach and pasting the code.
export async function POST() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;
  try {
    const solves = await recentSolves(20);
    const supabase = await createClient();
    const { data: existing } = await supabase.from('dsa_problems').select('slug');
    const have = new Set((existing ?? []).map((r) => r.slug as string));
    const fresh = solves.filter((s) => !have.has(s.slug));
    if (fresh.length) {
      const { error } = await supabase.from('dsa_problems').insert(
        fresh.map((s) => ({
          title: s.title,
          slug: s.slug,
          number: s.number,
          url: s.url,
          difficulty: s.difficulty,
          topics: s.topics,
          language: s.language,
          solved_at: s.solvedAt,
          published: false,
        })),
      );
      if (error) throw error;
    }
    return NextResponse.json({ found: solves.length, imported: fresh.length });
  } catch (err) {
    console.error('LeetCode sync failed', err);
    return NextResponse.json({ error: 'Could not reach LeetCode right now — try again in a minute.' }, { status: 502 });
  }
}
