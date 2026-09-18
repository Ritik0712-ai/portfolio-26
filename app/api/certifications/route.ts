import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Public endpoint — returns only published certifications, ordered for display.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: certifications, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ certifications });
  } catch (err) {
    console.error('Error fetching certifications:', err);
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
  }
}
