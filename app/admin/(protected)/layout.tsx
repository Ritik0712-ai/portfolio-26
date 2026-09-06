import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Guards every admin route except /admin/login, which deliberately sits
// outside this route group. "(protected)" is a route group, so it does
// not appear in the URL: (protected)/blogs still serves /admin/blogs.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    await supabase.auth.signOut();
    redirect('/admin/login');
  }

  return <>{children}</>;
}
