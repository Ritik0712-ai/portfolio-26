'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { Certification } from '@/types';

interface FormState {
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_url: string;
  image_url: string;
  published: boolean;
}

const emptyForm: FormState = {
  title: '',
  issuer: '',
  issue_date: '',
  expiry_date: '',
  credential_url: '',
  image_url: '',
  published: true,
};

export default function CertificationsAdminPage() {
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchCertifications = async () => {
    try {
      const res = await fetch('/api/admin/certifications');
      const data = await res.json();
      setCertifications(data.certifications || []);
    } catch {
      toast('Failed to load certifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cert: Certification) => {
    setEditing(cert);
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      credential_url: cert.credential_url || '',
      image_url: cert.image_url || '',
      published: cert.published,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast('Title and issuer are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        credential_url: form.credential_url || null,
        image_url: form.image_url || null,
        published: form.published,
        display_order: editing
          ? editing.display_order
          : certifications.length,
      };

      const res = await fetch(
        editing ? `/api/admin/certifications?id=${editing.id}` : '/api/admin/certifications',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast(editing ? 'Certification updated' : 'Certification created', 'success');
      setModalOpen(false);
      fetchCertifications();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/certifications?id=${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Deleted', 'success');
      setDeleteId(null);
      fetchCertifications();
    } else {
      toast('Failed to delete', 'error');
    }
  };

  const togglePublished = async (cert: Certification) => {
    const res = await fetch(`/api/admin/certifications?id=${cert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !cert.published }),
    });
    if (res.ok) {
      toast(cert.published ? 'Hidden from site' : 'Published', 'success');
      fetchCertifications();
    } else {
      toast('Failed to update', 'error');
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = certifications[index];
    const target = certifications[index + direction];
    if (!current || !target) return;

    const res = await Promise.all([
      fetch(`/api/admin/certifications?id=${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: target.display_order }),
      }),
      fetch(`/api/admin/certifications?id=${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: current.display_order }),
      }),
    ]);

    if (res.every((r) => r.ok)) fetchCertifications();
    else toast('Failed to reorder', 'error');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Certifications</h1>
          <p className="text-sm text-text-muted font-body mt-1">
            Credentials shown on the homepage.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Certification
        </Button>
      </div>

      {loading ? (
        <p className="text-text-muted font-body text-sm">Loading...</p>
      ) : certifications.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center">
          <Award className="w-6 h-6 text-text-faint mx-auto mb-3" />
          <p className="text-text-muted font-body text-sm">No certifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, i) => (
            <div
              key={cert.id}
              className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4"
            >
              {cert.image_url ? (
                <img
                  src={cert.image_url}
                  alt={cert.title}
                  className="w-10 h-10 rounded object-contain bg-bg-secondary shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-accent/20 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-accent" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium font-body text-text-primary truncate">
                    {cert.title}
                  </p>
                  {!cert.published && <Badge>Draft</Badge>}
                </div>
                <p className="text-xs text-text-muted font-body mt-0.5">
                  {cert.issuer}
                  {cert.issue_date
                    ? ` — ${new Date(cert.issue_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="p-2 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === certifications.length - 1}
                  aria-label="Move down"
                  className="p-2 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublished(cert)}
                  aria-label={cert.published ? 'Hide' : 'Publish'}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {cert.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(cert)}
                  aria-label="Edit"
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(cert.id)}
                  aria-label="Delete"
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Certification' : 'Add Certification'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="AWS Certified Cloud Practitioner"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Issuer"
            placeholder="Amazon Web Services"
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Issue date"
              type="date"
              value={form.issue_date}
              onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            />
            <Input
              label="Expiry date"
              type="date"
              hint="Optional"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
          </div>
          <Input
            label="Credential URL"
            placeholder="https://..."
            hint="Verification link, optional"
            value={form.credential_url}
            onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
          />
          <div className="space-y-2">
            <label className="text-sm font-body font-medium text-text-secondary">Badge image</label>
            <ImageUploader
              bucket="portfolio-media"
              folder="certifications"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
              onRemove={() => setForm((prev) => ({ ...prev, image_url: '' }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-body text-text-secondary">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible on site)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete certification"
        message="This can't be undone."
      />
    </div>
  );
}
