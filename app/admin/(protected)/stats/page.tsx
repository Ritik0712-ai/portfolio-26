'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Stat {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  display_order: number | null;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: 'Code', label: 'Code' },
  { value: 'Users', label: 'Users' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Coffee', label: 'Coffee' },
  { value: 'Star', label: 'Star' },
  { value: 'Award', label: 'Award' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Book', label: 'Book' },
  { value: 'Terminal', label: 'Terminal' },
];

export default function StatsAdminPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ icon: 'Code', value: '', suffix: '', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data.stats || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditingStat(null);
    setForm({ icon: 'Code', value: '', suffix: '', label: '' });
    setModalOpen(true);
  };

  const openEdit = (stat: Stat) => {
    setEditingStat(stat);
    setForm({ icon: stat.icon, value: String(stat.value), suffix: stat.suffix, label: stat.label });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value || !form.label) return;
    setSaving(true);
    const payload = { ...form, value: Number(form.value) };
    const res = await fetch(
      editingStat ? `/api/admin/stats?id=${editingStat.id}` : '/api/admin/stats',
      { method: editingStat ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (res.ok) {
      toast(editingStat ? 'Stat updated' : 'Stat created', 'success');
      setModalOpen(false);
      fetchStats();
    } else {
      toast('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/stats?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Stat deleted', 'success');
      setDeleteId(null);
      fetchStats();
    } else {
      toast('Failed to delete', 'error');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Stats</h1>
          <p className="text-sm text-text-muted mt-1">Number highlights displayed on the homepage</p>
        </div>
        <Button variant="primary" onClick={openNew}>
          <Plus className="w-4 h-4" /> New Stat
        </Button>
      </div>

      {loading ? (
        <div className="text-text-muted py-12 text-center">Loading…</div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-text-muted">No stats yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Label</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Value</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Icon</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Order</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-body font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.id} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-text-primary font-body">{stat.label}</td>
                  <td className="px-4 py-3 text-text-primary font-mono">{stat.value}{stat.suffix}</td>
                  <td className="px-4 py-3 text-text-muted">{stat.icon}</td>
                  <td className="px-4 py-3 text-text-muted">{stat.display_order ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(stat)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(stat.id)} className="p-1.5 text-text-muted hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingStat ? 'Edit Stat' : 'New Stat'} size="sm">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Projects Shipped" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="42" required />
            <Input label="Suffix" value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="+" />
          </div>
          <Select label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} options={ICON_OPTIONS} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">{editingStat ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Stat?" size="sm">
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
