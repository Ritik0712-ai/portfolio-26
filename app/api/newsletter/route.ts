import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, confirmed')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json({ error: 'Already subscribed!' }, { status: 409 });
      }
      // Resend confirmation
      return NextResponse.json({ success: true, message: 'Check your inbox to confirm!' });
    }

    // Add new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        confirmed: false,
      });

    if (error) {
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Check your inbox to confirm!' });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
