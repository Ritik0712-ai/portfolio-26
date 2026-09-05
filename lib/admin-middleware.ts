import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Protect an admin route — redirect to /admin/login if not authenticated.
 * Use as the first check in admin page Server Components or Route Handlers.
 */
export async function protectAdminRoute(): Promise<
  { authorized: true; userId: string } | { authorized: false; redirect: NextResponse }
> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      redirect: NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')),
    };
  }

  // Check admin allowlist
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return {
      authorized: false,
      redirect: NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')),
    };
  }

  return { authorized: true, userId: user.id };
}
