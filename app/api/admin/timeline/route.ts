import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json({ events: data })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('timeline_events')
      .insert([body])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error creating timeline event:', error)
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { data, error } = await supabase
      .from('timeline_events')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error updating timeline event:', error)
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting timeline event:', error)
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 })
  }
}
