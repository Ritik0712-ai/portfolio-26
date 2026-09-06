import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/metadata';

// Opened from a link in an email, so this redirects to a human-readable page
// rather than returning JSON.
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.redirect(`${siteUrl}/newsletter?state=invalid`);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('confirm_newsletter', {
      p_token: token,
    });
    if (error) throw error;
    return NextResponse.redirect(
      `${siteUrl}/newsletter?state=${data ? 'confirmed' : 'invalid'}`
    );
  } catch (err) {
    console.error('confirm_newsletter failed:', err);
    return NextResponse.redirect(`${siteUrl}/newsletter?state=error`);
  }
}
