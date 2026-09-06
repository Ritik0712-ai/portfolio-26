'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface ActivityEntry {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user_id: string;
}

export default function AdminActivityLogPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await loadLogs(1);
      } else {
        window.location.href = '/admin/login';
      }
      setLoading(false);
    })();
  }, []);

  const loadLogs = async (pageNum: number) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(limit),
    });
    if (filterAction) params.set('action', filterAction);
    if (filterResource) params.set('resource_type', filterResource);

    const res = await fetch(`/api/admin/activity-log?${params.toString()}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Failed to load activity log');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLogs(data.data || []);
    setTotal(data.total || 0);
    setPage(pageNum);
    setLoading(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const renderDetails = (details: Record<string, unknown>) => {
    const entries = Object.entries(details);
    if (!entries.length) return <span className="text-text-faint">—</span>;
    return (
      <div className="text-xs text-text-muted max-w-xs truncate">
        {entries.slice(0, 3).map(([k, v]) => (
          <span key={k} className="mr-2">
            {k}:{String(v)}
          </span>
        ))}
      </div>
    );
  };

  const applyFilters = async () => {
    await loadLogs(1);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-bg-secondary text-sm text-text-muted mb-2">
              <Activity className="w-4 h-4" />
              Admin
            </div>
            <h1 className="text-xl font-display font-semibold text-text-primary">
              Activity Log
            </h1>
            <p className="text-sm text-text-muted">Track all admin actions and changes</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <input
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="Filter action"
              className="rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent"
            />
            <input
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              placeholder="Filter resource type"
              className="rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent"
            />
            <button
              onClick={applyFilters}
              className="rounded border border-border px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
            >
              Apply
            </button>
          </div>
          <div className="text-sm text-text-muted">
            {total > 0 && (
              <span>
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, total)} of {total}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/60">
                  <th className="px-4 py-3 text-text-muted font-medium">Action</th>
                  <th className="px-4 py-3 text-text-muted font-medium">Resource</th>
                  <th className="px-4 py-3 text-text-muted font-medium">Details</th>
                  <th className="px-4 py-3 text-text-muted font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      Loading activity...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      No activity entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-b-0 hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{entry.action}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.resource_type || '—'}</td>
                      <td className="px-4 py-3">{renderDetails(entry.details)}</td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(entry.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <button
                disabled={page <= 1}
                onClick={() => loadLogs(page - 1)}
                className="inline-flex items-center gap-1 rounded border border-border px-3 py-2 text-sm text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => loadLogs(page + 1)}
                className="inline-flex items-center gap-1 rounded border border-border px-3 py-2 text-sm text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
