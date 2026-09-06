'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  display_order: number | null;
  created_at: string;
}

export default function TimelineAdminPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '' });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/timeline');
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', description: '', event_date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEdit = (e: TimelineEvent) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || '', event_date: e.event_date });
    setModalOpen(true);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title || !form.event_date) return;
    setSaving(true);
    const res = await fetch(
      editing ? `/api/admin/timeline?id=${editing.id}` : '/api/admin/timeline',
      { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }
    );
    if (res.ok) {
      toast(editing ? 'Event updated' : 'Event created', 'success');
      setModalOpen(false);
      fetchEvents();
    } else {
      toast('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/timeline?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) { toast('Deleted', 'success'); setDeleteId(null); fetchEvents(); }
    else toast('Failed to delete', 'error');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    setShowBulkConfirm(false);
    try {
      const res = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'timeline', action: bulkAction, ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Bulk action failed', 'error');
      } else {
        toast(`Bulk ${bulkAction} completed`, 'success');
        setSelectedIds(new Set());
        setBulkAction('');
        fetchEvents();
      }
    } catch {
      toast('Network error', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Timeline</h1>
          <p className="text-sm text-text-muted mt-1">Career and life events shown on the About section</p>
        </div>
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> New Event</Button>
      </div>

      {loading ? (
        <div className="text-text-muted py-12 text-center">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-text-muted">No timeline events yet.</p>
        </div>
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-accent/5 p-3 mb-4">
              <span className="text-sm text-text-muted">{selectedIds.size} selected</span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">Select action</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={() => setShowBulkConfirm(true)}
                disabled={!bulkAction || bulkProcessing}
                className="rounded border border-border px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => { setSelectedIds(new Set()); setBulkAction(''); }}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary">
                  <th className="text-left px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary transition-colors">
                      {selectedIds.size === events.length && events.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Order</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className={`border-b border-border last:border-0 hover:bg-bg-secondary/50 transition-colors ${selectedIds.has(e.id) ? 'bg-accent/5' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(e.id)} className="text-text-muted hover:text-text-primary transition-colors">
                        {selectedIds.has(e.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{e.event_date}</td>
                    <td className="px-4 py-3 text-text-primary font-body">{e.title}</td>
                    <td className="px-4 py-3 text-text-muted text-sm max-w-xs truncate">{e.description || '—'}</td>
                    <td className="px-4 py-3 text-text-muted">{e.display_order ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-text-muted hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'New Event'} size="sm">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Input label="Date" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required />
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Started at VIT Bhopal" required />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details about this event…" rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Event?" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-text-secondary text-sm">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Bulk ${bulkAction}`}
        description={`This will permanently delete ${selectedIds.size} timeline events. This action cannot be undone.`}
        confirmLabel={bulkProcessing ? 'Processing...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={handleBulkAction}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}
