import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public route for fetching approved testimonials
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json({ testimonials: data })
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}
