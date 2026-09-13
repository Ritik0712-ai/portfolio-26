import type { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction = 'create' | 'update' | 'delete' | 'publish' | 'approve' | 'bulk' | 'export' | 'import';

/**
 * Records an admin action.
 *
 * Deliberately never throws. An audit trail is useful, but it is not worth
 * failing a user's save over — if the insert fails we log to the server
 * console and let the original request succeed.
 */
export async function logActivity(
  supabase: SupabaseClient,
  entry: {
    userId: string;
    action: ActivityAction;
    resourceType: string;
    resourceId?: string | null;
    details?: Record<string, unknown>;
  }
) {
  try {
    const { error } = await supabase.from('activity_log').insert({
      user_id: entry.userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
    });
    if (error) console.error('activity_log insert failed:', error.message);
  } catch (err) {
    console.error('activity_log insert threw:', err);
  }
}
