import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json({ stats: data })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('stats')
      .insert([body])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ stat: data })
  } catch (error) {
    console.error('Error creating stat:', error)
    return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { data, error } = await supabase
      .from('stats')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ stat: data })
  } catch (error) {
    console.error('Error updating stat:', error)
    return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('stats')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stat:', error)
    return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 })
  }
}
