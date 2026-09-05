import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: events, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ events });
  } catch (err) {
    console.error('Error fetching timeline:', err);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
