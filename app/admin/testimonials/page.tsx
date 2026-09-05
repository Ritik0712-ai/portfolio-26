'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  content: string;
  rating: number | null;
  approved: boolean;
  display_order: number | null;
  created_at: string;
}

export default function TestimonialsAdminPage() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', company: '', avatar: '', content: '', rating: '5', approved: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/testimonials');
    const data = await res.json();
    setTestimonials(data.testimonials || []);
    setLoading(false);
  };

  const filtered = testimonials.filter(t => {
    if (filter === 'approved') return t.approved;
    if (filter === 'pending') return !t.approved;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', avatar: '', content: '', rating: '5', approved: true });
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', company: t.company || '', avatar: t.avatar || '', content: t.content, rating: String(t.rating ?? 5), approved: t.approved });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) return;
    setSaving(true);
    const payload = { ...form, rating: Number(form.rating) };
    const res = await fetch(
      editing ? `/api/admin/testimonials?id=${editing.id}` : '/api/admin/testimonials',
      { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (res.ok) {
      toast(editing ? 'Testimonial updated' : 'Testimonial created', 'success');
      setModalOpen(false);
      fetchTestimonials();
    } else {
      toast('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/testimonials?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) { toast('Deleted', 'success'); setDeleteId(null); fetchTestimonials(); }
    else toast('Failed to delete', 'error');
  };

  const toggleApproved = async (t: Testimonial) => {
    const res = await fetch(`/api/admin/testimonials?id=${t.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, approved: !t.approved }),
    });
    if (res.ok) { toast(t.approved ? 'Hidden' : 'Approved', 'success'); fetchTestimonials(); }
    else toast('Failed to update', 'error');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Testimonials</h1>
          <p className="text-sm text-text-muted mt-1">Manage social proof displayed on the site</p>
        </div>
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> New Testimonial</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'approved', 'pending'] as const).map(f => (
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
          <p className="text-text-muted">No testimonials found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-body font-medium text-text-primary">{t.name}</span>
                    {t.role && <span className="text-sm text-text-muted">{t.role}{t.company ? ` at ${t.company}` : ''}</span>}
                    <Badge variant={t.approved ? 'success' : 'warning'}>{t.approved ? 'Approved' : 'Pending'}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{t.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleApproved(t)} className={`p-1.5 rounded transition-colors ${t.approved ? 'text-success' : 'text-text-muted hover:text-success'}`} title={t.approved ? 'Approved — click to unapprove' : 'Approve'}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(t)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-text-muted hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Testimonial' : 'New Testimonial'} size="md">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
            <Input label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Software Engineer" />
          </div>
          <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." />
          <Textarea label="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="What did they say about working with you?" rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Rating (1-5)" type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            <label className="flex items-center gap-2 pt-6 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" checked={form.approved} onChange={e => setForm({ ...form, approved: e.target.checked })} className="w-4 h-4 accent-accent" />
              Approved for display
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Testimonial?" size="sm">
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
