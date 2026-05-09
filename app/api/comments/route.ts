import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    let query = supabase
      .from('comments')
      .select('*')
      .eq('approved', true) // Only show approved comments
    
    if (slug) {
      query = query.eq('slug', slug)
    }
    
    const { data: comments, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to read comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, slug } = await request.json()
    
    if (!name || !message || !slug) {
      return NextResponse.json({ error: 'Name, message, and slug are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        name,
        email: email || '',
        message,
        slug,
        approved: false, // Comments require approval
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ success: true, comment: data })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}

// PATCH to approve comments
export async function PATCH(request: NextRequest) {
  try {
    const { id, approved } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('comments')
      .update({ approved: approved ?? true })
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}
