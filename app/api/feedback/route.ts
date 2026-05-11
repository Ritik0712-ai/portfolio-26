import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public route for submitting feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('feedback')
      .insert([body])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ success: true, feedback: data })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
