import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendConfirmationEmail } from '@/lib/newsletter';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = await createClient();

    // subscribe_newsletter is SECURITY DEFINER. anon deliberately has no SELECT
    // or UPDATE on newsletter_subscribers — it holds email addresses — so the
    // duplicate check has to happen inside the database, not here. The old
    // version did .select() from the client and always came back empty, so the
    // "already subscribed" branch never fired and repeats hit the unique
    // constraint as a 500.
    const { data, error } = await supabase.rpc('subscribe_newsletter', {
      p_email: email,
    });

    if (error) {
      console.error('subscribe_newsletter failed:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    const result = Array.isArray(data) ? data[0] : data;
    const status = result?.status as string | undefined;
    const token = result?.token as string | undefined;

    if (status === 'invalid') {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (token) {
      const send = await sendConfirmationEmail(email, token);
      if (!send.ok) console.error('Confirmation email not sent:', send.reason);
    }

    // Same response whether the address is new, pending or already confirmed —
    // otherwise this endpoint becomes a way to probe who is on the list.
    return NextResponse.json({
      success: true,
      message: 'Check your inbox to confirm.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
