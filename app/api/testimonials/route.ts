import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
