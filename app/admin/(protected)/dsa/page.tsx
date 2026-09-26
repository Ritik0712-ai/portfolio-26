'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, ExternalLink, Repeat, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DSA_LANGUAGES, slugify, topicOf } from '@/lib/dsa';
import type { DsaProblem } from '@/types';

type Form = {
  title: string;
  slug: string;
  number: string;
  url: string;
  difficulty: '' | 'Easy' | 'Medium' | 'Hard';
  topics: string;
  approach: string;
  time_complexity: string;
  space_complexity: string;
  code: string;
  language: string;
  notes: string;
  revisit: boolean;
  solved_at: string;
  published: boolean;
};

const today = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
const EMPTY: Form = {
  title: '', slug: '', number: '', url: '', difficulty: '', topics: '', approach: '', time_complexity: '', space_complexity: '',
  code: '', language: '', notes: '', revisit: false, solved_at: today(), published: false,
};

const DIFF_VARIANT = { Easy: 'success', Medium: 'warning', Hard: 'error' } as const;

export default function DsaAdminPage() {
  const { toast } = useToast();
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState<DsaProblem | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'drafts' | 'published'>('all');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/dsa', { cache: 'no-store' });
    const data = await res.json();
    setProblems(data.problems || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(
    () =>
      problems
        .filter((p) => (filter === 'drafts' ? !p.published : filter === 'published' ? p.published : true))
        .filter((p) => !q.trim() || `${p.title} ${p.topics.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())),
    [problems, filter, q],
  );
  const drafts = problems.filter((p) => !p.published).length;

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, solved_at: today() });
    setOpen(true);
  };
  const openEdit = (p: DsaProblem) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, number: p.number ? String(p.number) : '', url: p.url ?? '', difficulty: p.difficulty ?? '',
      topics: p.topics.join(', '), approach: p.approach ?? '', time_complexity: p.time_complexity ?? '', space_complexity: p.space_complexity ?? '',
      code: p.code ?? '', language: p.language ?? '', notes: p.notes ?? '', revisit: p.revisit, solved_at: p.solved_at, published: p.published,
    });
    setOpen(true);
  };

  const payload = (f: Form) => ({
    title: f.title.trim(),
    slug: f.slug.trim() || undefined,
    number: f.number ? Number(f.number) : null,
    url: f.url.trim(),
    difficulty: f.difficulty || null,
    topics: f.topics.split(',').map((t) => t.trim()).filter(Boolean),
    approach: f.approach || null,
    time_complexity: f.time_complexity || null,
    space_complexity: f.space_complexity || null,
    code: f.code || null,
    language: f.language || null,
    notes: f.notes || null,
    revisit: f.revisit,
    solved_at: f.solved_at,
    published: f.published,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await fetch(editing ? `/api/admin/dsa?id=${editing.id}` : '/api/admin/dsa', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(form)),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return toast(data.error || 'Failed to save', 'error');
    toast(editing ? 'Problem updated' : 'Problem added', 'success');
    setOpen(false);
    load();
  };

  const togglePublish = async (p: DsaProblem) => {
    const res = await fetch(`/api/admin/dsa?id=${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.ok) {
      toast(p.published ? 'Moved to drafts' : 'Published', 'success');
      load();
    } else toast('Failed to update', 'error');
  };

  const remove = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/dsa?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Deleted', 'success');
      setDeleteId(null);
      load();
    } else toast('Failed to delete', 'error');
  };

  const sync = async () => {
    setSyncing(true);
    const res = await fetch('/api/admin/dsa/sync', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setSyncing(false);
    if (!res.ok) return toast(data.error || 'Sync failed', 'error');
    toast(
      data.imported ? `Imported ${data.imported} new problem${data.imported === 1 ? '' : 's'} as drafts` : data.found ? 'Already up to date' : 'No accepted submissions on LeetCode yet',
      'success',
    );
    load();
  };

  const topic = form.topics ? topicOf({ topics: form.topics.split(',').map((t) => t.trim()) }) : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">DSA Journal</h1>
          <p className="text-sm text-text-muted mt-1">
            Problems you solve, with your approach and code. Published entries appear on <Link href="/dsa" className="underline" target="_blank">/dsa</Link>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={sync} loading={syncing}>
            <RefreshCw className="w-4 h-4" /> Sync from LeetCode
          </Button>
          <Button variant="primary" onClick={openNew}>
            <Plus className="w-4 h-4" /> Add problem
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['all', 'drafts', 'published'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded border capitalize ${filter === f ? 'bg-text-primary text-bg border-text-primary' : 'border-border text-text-muted hover:text-text-primary'}`}
          >
            {f}
            {f === 'drafts' && drafts > 0 ? ` (${drafts})` : ''}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 px-3 py-1.5 border border-border rounded bg-surface text-sm">
          <Search className="w-4 h-4 text-text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="bg-transparent outline-none w-48" />
        </label>
      </div>

      {loading ? (
        <p className="text-text-muted py-12 text-center">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-border rounded-lg">
          <p className="text-text-primary font-medium">{problems.length ? 'Nothing matches this filter.' : 'Your journal is empty.'}</p>
          {!problems.length && (
            <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">
              Solve a problem on LeetCode, then press <strong>Sync from LeetCode</strong> — it arrives here as a draft with its title, difficulty and topics filled in.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary text-xs uppercase tracking-wider text-text-muted">
                <th className="text-left px-4 py-3 font-medium">Problem</th>
                <th className="text-left px-4 py-3 font-medium">Topic</th>
                <th className="text-left px-4 py-3 font-medium">Solved</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const t = topicOf(p);
                const missing = [!p.approach && 'approach', !p.code && 'code', !p.time_complexity && 'complexity'].filter(Boolean);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg-secondary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.difficulty && <Badge variant={DIFF_VARIANT[p.difficulty]}>{p.difficulty}</Badge>}
                        <span className="text-text-primary font-medium">{p.number ? `${p.number}. ` : ''}{p.title}</span>
                        {p.revisit && <Repeat className="w-3.5 h-3.5 text-warning" aria-label="Revisit" />}
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-text-faint hover:text-text-primary"><ExternalLink className="w-3.5 h-3.5" /></a>
                        )}
                      </div>
                      {missing.length > 0 && <p className="text-xs text-text-faint mt-0.5">Missing: {missing.join(', ')}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{t?.label ?? '—'}</td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{p.solved_at}</td>
                    <td className="px-4 py-3">{p.published ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => togglePublish(p)} className="p-1.5 text-text-muted hover:text-text-primary" title={p.published ? 'Unpublish' : 'Publish'}>
                          {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-text-muted hover:text-text-primary" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-text-muted hover:text-error" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit problem' : 'Add problem'} size="xl">
        <form onSubmit={save} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid md:grid-cols-[1fr_120px] gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} placeholder="Two Sum" required />
            <Input label="LeetCode #" type="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="1" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Problem link" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://leetcode.com/problems/two-sum/" />
            <Input label="URL slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint={`/dsa/${form.slug || '…'}`} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as Form['difficulty'] })}
              options={[{ value: '', label: '—' }, { value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }]}
            />
            <Input label="Solved on" type="date" value={form.solved_at} onChange={(e) => setForm({ ...form, solved_at: e.target.value })} />
            <Select label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} options={[{ value: '', label: '—' }, ...DSA_LANGUAGES]} />
          </div>
          <Input
            label="Topics (comma separated)"
            value={form.topics}
            onChange={(e) => setForm({ ...form, topics: e.target.value })}
            placeholder="Array, Hash Table"
            hint={topic ? `Counts towards: ${topic.label}` : 'Use LeetCode tag names so it lands in the right roadmap topic'}
          />
          <Textarea label="Approach (Markdown)" rows={7} value={form.approach} onChange={(e) => setForm({ ...form, approach: e.target.value })} placeholder={'Intuition, then the idea step by step.\n\n- Store each number\'s index in a hash map…'} />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Time complexity" value={form.time_complexity} onChange={(e) => setForm({ ...form, time_complexity: e.target.value })} placeholder="O(n)" />
            <Input label="Space complexity" value={form.space_complexity} onChange={(e) => setForm({ ...form, space_complexity: e.target.value })} placeholder="O(n)" />
          </div>
          <Textarea label="Code" rows={10} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="font-mono text-xs" spellCheck={false} />
          <Textarea label="Notes / mistakes to remember (optional)" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.revisit} onChange={(e) => setForm({ ...form, revisit: e.target.checked })} /> Revisit before interviews</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">{editing ? 'Save' : 'Add'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete this problem?" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-text-secondary text-sm">This removes it from the journal. It can&apos;t be undone.</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={remove} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
