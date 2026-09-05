'use client';

import { useState, useEffect } from 'react';
import { Check, Trash2, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
    else toast('Failed to convert', 'error');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/feedback?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) { toast('Deleted', 'success'); setDeleteId(null); fetchFeedback(); }
    else toast('Failed to delete', 'error');
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
        <div className="space-y-4">
          {filtered.map(f => (
            <div key={f.id} className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-body font-medium text-text-primary">{f.name}</span>
                    {f.role && <span className="text-sm text-text-muted">{f.role}{f.company ? ` at ${f.company}` : ''}</span>}
                    {f.rating && renderStars(f.rating)}
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
    </div>
  );
}
