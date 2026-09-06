'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

type Strategy = 'upsert' | 'replace';

interface ExportPayload {
  blogs: unknown[];
  projects: unknown[];
  testimonials: unknown[];
  timeline: unknown[];
  stats: unknown[];
  exportedAt: string;
}

export default function AdminExportImportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>('upsert');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        window.location.href = '/admin/login';
      }
      setLoading(false);
    })();
  }, []);

  const handleExport = async () => {
    setMessage(null);
    const res = await fetch('/api/admin/export');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage({ type: 'error', text: body.error || 'Export failed' });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Export downloaded successfully.' });
  };

  const handleImport = async () => {
    setMessage(null);
    if (!importFile) {
      setMessage({ type: 'error', text: 'Choose a JSON file to import.' });
      return;
    }
    setImporting(true);
    try {
      const text = await importFile.text();
      const json = JSON.parse(text) as ExportPayload;
      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: json, strategy }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: body.error || 'Import failed' });
      } else {
        setMessage({ type: 'success', text: body.message || 'Import completed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid JSON file.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-bg-secondary text-sm text-text-muted mb-2">
              <Download className="w-4 h-4" />
              Admin
            </div>
            <h1 className="text-xl font-display font-semibold text-text-primary">
              Export / Import
            </h1>
            <p className="text-sm text-text-muted">Back up your portfolio data or migrate from another site</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {message && (
          <div
            className={`flex items-center gap-2 rounded border p-3 text-sm ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-serif text-lg font-semibold text-text-primary">Export</h2>
            <p className="mt-2 text-sm text-text-muted">
              Download a full JSON backup of your blogs, projects, testimonials, timeline, and stats.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Export
            </button>
          </div>

          {/* Import */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-serif text-lg font-semibold text-text-primary">Import</h2>
            <p className="mt-2 text-sm text-text-muted">
              Upload a previously exported JSON file to restore or migrate data.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="file"
                accept="application/json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-accent/90"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-text-muted">Strategy:</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as Strategy)}
                  className="rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="upsert">Upsert (update existing, add new)</option>
                  <option value="replace">Replace (delete all then import)</option>
                </select>
              </div>
              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
