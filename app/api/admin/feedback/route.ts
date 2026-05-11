import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all feedback (admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST - create testimonial from feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mark feedback as reviewed
    if (body.feedbackId) {
      await supabase
        .from('feedback')
        .update({ reviewed: true })
        .eq('id', body.feedbackId)
    }
    
    // Create testimonial from feedback
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        name: body.name,
        role: body.role,
        company: body.company,
        content: body.content,
        rating: body.rating,
        approved: true,
        display_order: 10,
      }])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ success: true, testimonial: data })
  } catch (error) {
    console.error('Error creating testimonial from feedback:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}

// PUT - mark feedback as reviewed
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { data, error } = await supabase
      .from('feedback')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}

// DELETE feedback
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
