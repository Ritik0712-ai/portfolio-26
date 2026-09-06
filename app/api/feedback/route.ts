import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public route for submitting feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.name?.trim() || !body?.content?.trim()) {
      return NextResponse.json(
        { error: 'Name and feedback content are required' },
        { status: 400 }
      )
    }

    // Whitelist the columns a public submitter may set. Never spread the raw
    // body: unknown keys fail with PGRST204, and `reviewed` must stay false so
    // nobody can self-approve their own feedback.
    const payload = {
      name: String(body.name).trim(),
      email: body.email ? String(body.email).trim() : null,
      role: body.role ? String(body.role).trim() : null,
      company: body.company ? String(body.company).trim() : null,
      project: body.project ? String(body.project).trim() : null,
      rating: typeof body.rating === 'number' ? body.rating : null,
      content: String(body.content).trim(),
      permission_display: body.permission_display === true,
      reviewed: false,
    }

    // No .select() here. `anon` has no SELECT policy on `feedback` (deliberate —
    // it keeps submitted emails private), so a RETURNING clause fails with
    // 42501 "new row violates row-level security policy".
    const { error } = await supabase.from('feedback').insert(payload)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
