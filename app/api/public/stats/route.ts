import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public route for fetching stats
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json({ stats: data }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
