import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const DAYS = 14;

/**
 * Aggregates for the activity charts. Aggregating here rather than in the
 * browser means the page doesn't download every log row just to count them,
 * which will matter once this table holds months of history.
 */
export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('activity_log')
      .select('action, resource_type, created_at')
      .gte('created_at', since.toISOString());
    if (error) throw error;

    const rows = data ?? [];

    // One bucket per day, including days with no activity, so the bar chart
    // doesn't silently compress gaps and imply steadier output than there was.
    const byDay: { date: string; count: number }[] = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      byDay.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    const dayIndex = new Map(byDay.map((b, i) => [b.date, i]));

    const byResource = new Map<string, number>();
    const byAction = new Map<string, number>();

    for (const r of rows) {
      const key = String(r.created_at).slice(0, 10);
      const idx = dayIndex.get(key);
      if (idx !== undefined) byDay[idx].count++;

      const rt = r.resource_type ?? 'unknown';
      byResource.set(rt, (byResource.get(rt) ?? 0) + 1);
      const ac = r.action ?? 'unknown';
      byAction.set(ac, (byAction.get(ac) ?? 0) + 1);
    }

    // Array.from rather than spreading the iterator — this tsconfig targets
    // below ES2015 and would need downlevelIteration to spread a Map.
    const toSorted = (m: Map<string, number>) =>
      Array.from(m.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total: rows.length,
      days: DAYS,
      byDay,
      byResource: toSorted(byResource),
      byAction: toSorted(byAction),
    });
  } catch (err) {
    console.error('Error building activity summary:', err);
    return NextResponse.json({ error: 'Failed to build activity summary' }, { status: 500 });
  }
}
