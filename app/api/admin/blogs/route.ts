import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json({ blogs })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const blog = await request.json()
    const { data, error } = await supabase
      .from('blogs')
      .insert([{
        ...blog,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ success: true, blog: data })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const blog = await request.json()
    const { data, error } = await supabase
      .from('blogs')
      .update({ ...blog, updated_at: new Date().toISOString() })
      .eq('id', blog.id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ success: true, blog: data })
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Blog ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
  }
}
