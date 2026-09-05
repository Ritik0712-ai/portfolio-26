import { createClient as createServerClient } from '@/lib/supabase/server';
import { cache } from 'react';

/**
 * Get the current authenticated user (cached per request).
 */
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

/**
 * Check if the given user ID is in the admin allowlist.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  return !error && data !== null;
}

/**
 * Verify that the current request is from an authenticated admin.
 * Returns the user if authorized, null otherwise.
 */
export async function requireAdmin(): Promise<{ user: import('@supabase/supabase-js').User } | { user: null; error: Response }> {
  const user = await getAuthenticatedUser();

  if (!user) {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
    return { user: null, error: response };
  }

  const admin = await isAdminUser(user.id);
  if (!admin) {
    const response = new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
    return { user: null, error: response };
  }

  return { user };
}
