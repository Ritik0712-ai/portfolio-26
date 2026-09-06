'use client';

import { useState, useEffect } from 'react';
import { Check, Trash2, Star, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface Feedback {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  company: string | null;
  project: string | null;
  rating: number | null;
  content: string;
  permission_display: boolean | null;
  reviewed: boolean;
  created_at: string;
}

export default function FeedbackAdminPage() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'pending'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/feedback');
    const data = await res.json();
    setFeedback(data.feedback || []);
    setLoading(false);
  };

  const filtered = feedback.filter(f => {
    if (filter === 'reviewed') return f.reviewed;
    if (filter === 'pending') return !f.reviewed;
    return true;
  });

  const markReviewed = async (f: Feedback) => {
    const res = await fetch(`/api/admin/feedback?id=${f.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, reviewed: true }),
    });
    if (res.ok) { toast('Marked as reviewed', 'success'); fetchFeedback(); }
    else toast('Failed to update', 'error');
  };

  const convertToTestimonial = async (f: Feedback) => {
    const res = await fetch('/api/admin/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId: f.id, name: f.name, role: f.role, company: f.company, content: f.content, rating: f.rating, approved: false }),
    });
    if (res.ok) { toast('Converted to testimonial', 'success'); fetchFeedback(); }
    else {
      // Surface the API's message — it names the offending field on a 400.
      const body = await res.json().catch(() => ({}));
      toast(body.error ? `Failed to convert — ${body.error}` : 'Failed to convert', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/feedback?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) { toast('Deleted', 'success'); setDeleteId(null); fetchFeedback(); }
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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    setShowBulkConfirm(false);

    if (bulkAction === 'delete') {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE' }).then((r) => r.json())
        )
      );
      toast(`Bulk delete completed`, 'success');
      setSelectedIds(new Set());
      setBulkAction('');
      fetchFeedback();
    } else if (bulkAction === 'mark-reviewed') {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/feedback?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewed: true }),
          }).then((r) => r.json())
        )
      );
      toast(`Bulk mark reviewed completed`, 'success');
      setSelectedIds(new Set());
      setBulkAction('');
      fetchFeedback();
    }

    setBulkProcessing(false);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-warning text-warning' : 'text-text-faint'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary">Feedback</h1>
        <p className="text-sm text-text-muted mt-1">Submitted testimonials and reviews from collaborators</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'reviewed', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-body font-medium rounded border transition-colors ${filter === f ? 'bg-accent text-white border-accent' : 'bg-surface border-border text-text-muted hover:text-text-primary'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-text-muted py-12 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-text-muted">No feedback found.</p>
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
                <option value="mark-reviewed">Mark reviewed</option>
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

          <div className="space-y-4">
            {filtered.map(f => (
              <div key={f.id} className={`bg-surface border border-border rounded-lg p-6 ${selectedIds.has(f.id) ? 'bg-accent/5' : ''}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleSelect(f.id)} className="mt-1 text-text-muted hover:text-text-primary transition-colors">
                    {selectedIds.has(f.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-body font-medium text-text-primary">{f.name}</span>
                      {f.role && <span className="text-sm text-text-muted">{f.role}{f.company ? ` at ${f.company}` : ''}</span>}
                      {f.rating && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= f.rating! ? 'fill-warning text-warning' : 'text-text-faint'}`} />
                          ))}
                        </div>
                      )}
                      {f.permission_display && <Badge variant="accent">Permission to display</Badge>}
                      <Badge variant={f.reviewed ? 'success' : 'warning'}>{f.reviewed ? 'Reviewed' : 'Pending'}</Badge>
                    </div>
                    {f.project && <p className="text-xs text-text-faint mb-2">Project: {f.project}</p>}
                    <p className="text-sm text-text-secondary">{f.content}</p>
                    <p className="text-xs text-text-faint mt-2">{new Date(f.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {!f.reviewed && (
                      <>
                        <button onClick={() => markReviewed(f)} className="p-1.5 text-text-muted hover:text-success transition-colors" title="Mark reviewed"><Check className="w-4 h-4" /></button>
                        <button onClick={() => convertToTestimonial(f)} className="p-1.5 text-text-muted hover:text-accent transition-colors" title="Convert to testimonial"><ArrowRight className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => setDeleteId(f.id)} className="p-1.5 text-text-muted hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Feedback?" size="sm">
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
        description={
          bulkAction === 'delete'
            ? `This will permanently delete ${selectedIds.size} feedback entries. This action cannot be undone.`
            : `This will mark ${selectedIds.size} feedback entries as reviewed.`
        }
        confirmLabel={bulkProcessing ? 'Processing...' : bulkAction === 'delete' ? 'Delete' : 'Mark reviewed'}
        cancelLabel="Cancel"
        onConfirm={handleBulkAction}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}
