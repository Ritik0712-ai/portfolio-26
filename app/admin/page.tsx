import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  MessageSquareQuote,
  Calendar,
} from 'lucide-react';
import { LogoutButton } from '@/components/admin/LogoutButton';

export default async function AdminDashboardPage() {
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

  // Fetch all stats in parallel
  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: totalBlogs },
    { count: publishedBlogs },
    { count: approvedTestimonials },
    { count: unreadFeedback },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('approved', true),
    supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('reviewed', false),
  ]);

  const stats = [
    { label: 'Total Projects', value: totalProjects ?? 0, icon: FolderKanban, href: '/admin/projects' },
    { label: 'Published Projects', value: publishedProjects ?? 0, icon: FolderKanban, href: '/admin/projects', highlight: true },
    { label: 'Total Blogs', value: totalBlogs ?? 0, icon: FileText, href: '/admin/blogs' },
    { label: 'Published Blogs', value: publishedBlogs ?? 0, icon: FileText, href: '/admin/blogs', highlight: true },
    { label: 'Testimonials', value: approvedTestimonials ?? 0, icon: MessageSquareQuote, href: '/admin/testimonials' },
    { label: 'Unread Feedback', value: unreadFeedback ?? 0, icon: MessageSquareQuote, href: '/admin/feedback', highlight: true },
  ];

  const navItems = [
    { label: 'Projects', description: 'Manage portfolio projects', href: '/admin/projects', icon: FolderKanban },
    { label: 'Blogs', description: 'Manage blog posts', href: '/admin/blogs', icon: FileText },
    { label: 'Stats', description: 'Edit stats and numbers', href: '/admin/stats', icon: BarChart3 },
    { label: 'Testimonials', description: 'Review and manage testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Timeline', description: 'Edit career timeline', href: '/admin/timeline', icon: Calendar },
    { label: 'Feedback', description: 'View visitor feedback', href: '/admin/feedback', icon: MessageSquareQuote },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Welcome back</p>
              <h1 className="text-2xl font-display font-semibold text-text-primary mt-0.5">
                {user.email}
              </h1>
            </div>
            <LogoutButton
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded border border-border text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-bg-secondary text-sm text-text-muted mb-4">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </div>
          <h2 className="text-3xl font-display font-semibold text-text-primary">
            Admin Dashboard
          </h2>
          <p className="text-text-muted mt-2">
            Manage your portfolio content and settings
          </p>
        </div>

        {/* Stats Cards */}
        <section className="mb-12">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-surface border border-border rounded-lg p-5 hover:border-text-faint hover:bg-surface-hover transition-all group"
              >
                <stat.icon className="w-5 h-5 text-text-muted mb-3 group-hover:text-text-primary transition-colors" />
                <p className="text-2xl font-display font-semibold text-text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Navigation Cards */}
        <section>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Management Sections
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="bg-surface border border-border rounded-lg p-6 hover:border-text-faint hover:shadow-sm transition-all group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded border border-border bg-bg mb-4 group-hover:border-text-faint group-hover:bg-bg-secondary transition-all">
                  <item.icon className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
                </div>
                <h4 className="font-display font-semibold text-text-primary group-hover:text-text-primary/80 transition-colors">
                  {item.label}
                </h4>
                <p className="text-sm text-text-muted mt-1">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
