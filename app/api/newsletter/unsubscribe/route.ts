import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/metadata';

async function remove(token: string | null) {
  if (!token) return 'invalid';
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('unsubscribe_newsletter', {
    p_token: token,
  });
  if (error) {
    console.error('unsubscribe_newsletter failed:', error);
    return 'error';
  }
  return data ? 'unsubscribed' : 'invalid';
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  const state = await remove(token);
  return NextResponse.redirect(`${siteUrl}/newsletter?state=${state}`);
}

// RFC 8058 one-click unsubscribe: Gmail and friends POST to the
// List-Unsubscribe URL without ever opening a browser.
export async function POST(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  const state = await remove(token);
  return NextResponse.json({ success: state === 'unsubscribed' });
}
