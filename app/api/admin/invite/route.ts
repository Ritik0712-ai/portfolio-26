import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  // Require admin authentication
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = await createClient();

    // Check if user with this email exists in auth
    const { data: authUser, error: authError } = await supabase
      .auth.admin.listUsers();

    if (authError) {
      console.error('Error listing users:', authError);
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    const targetUser = authUser.users.find((u) => u.email === email);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'No user found with that email. Please sign up first.' },
        { status: 404 }
      );
    }

    // Check if already in admin_users
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', targetUser.id)
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      );
    }

    // Insert into admin_users table
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([{ id: targetUser.id, email: targetUser.email }]);

    if (insertError) {
      console.error('Error adding admin:', insertError);
      return NextResponse.json(
        { error: 'Failed to add admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User added as admin successfully',
      user: { id: targetUser.id, email: targetUser.email },
    });
  } catch (err) {
    console.error('Error in admin invite:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
