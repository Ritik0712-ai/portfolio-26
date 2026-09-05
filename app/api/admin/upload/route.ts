import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { bucket, folder, filename, contentType } = await request.json();

    if (!bucket || !filename || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate unique path
    const ext = filename.split('.').pop() || 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = folder ? `${folder}/${uniqueName}` : uniqueName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }

    // Get public URL (Supabase public URL format)
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/upload — delete a file
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { bucket, path } = await request.json();

    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
