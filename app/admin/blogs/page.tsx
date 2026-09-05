'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Edit2, Eye, Trash2, Star, Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { useToast } from '@/components/ui/Toast';

interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  reading_time: string;
  featured: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = ['Tech', 'DSA', 'Life', 'Reflections'] as const;
const STATUSES = ['All', 'Published', 'Draft', 'Featured'] as const;

const initialFormData: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: 'Tech',
  tags: [],
  reading_time: '',
  featured: false,
  published: false,
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-body font-medium text-text-secondary">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 p-2 bg-surface border border-border rounded min-h-[42px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-error transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? 'Type tag and press Enter' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary placeholder:text-text-faint focus:outline-none"
        />
      </div>
      <p className="text-xs text-text-faint">Press Enter or comma to add a tag</p>
    </div>
  );
}

export default function BlogsPage() {
  const { toast } = useToast();

  // Data state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPost>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (data.blogs) {
        setBlogs(data.blogs);
      }
    } catch {
      toast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Search filter
      if (search && !blog.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All' && blog.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'Published' && !blog.published) return false;
      if (statusFilter === 'Draft' && blog.published) return false;
      if (statusFilter === 'Featured' && !blog.featured) return false;

      return true;
    });
  }, [blogs, search, categoryFilter, statusFilter]);

  // Open create modal
  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(initialFormData);
    setFormErrors({});
    setShowPreview(false);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (blog: BlogPost) => {
    setEditingPost(blog);
    setFormData({
      ...blog,
      tags: blog.tags || [],
    });
    setFormErrors({});
    setShowPreview(false);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingPost(null);
    setFormData(initialFormData);
    setFormErrors({});
    setShowPreview(false);
  };

  // Handle title change (auto-generate slug)
  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save blog
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Calculate reading time from content
      const readingTime = calculateReadingTime(formData.content);
      const blogData = { ...formData, reading_time: String(readingTime) };

      const isEditing = !!editingPost?.id;
      const url = isEditing
        ? `/api/admin/blogs?id=${editingPost.id}`
        : '/api/admin/blogs';

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save blog');
      }

      toast(
        isEditing ? 'Blog post updated successfully' : 'Blog post created successfully',
        'success'
      );
      closeModal();
      fetchBlogs();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save blog', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete blog
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete blog');
      }

      toast('Blog post deleted successfully', 'success');
      setDeleteTarget(null);
      fetchBlogs();
    } catch {
      toast('Failed to delete blog', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Preview URL
  const previewUrl = editingPost?.slug ? `/blog/${editingPost.slug}` : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">Blog Posts</h1>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-surface rounded-lg border border-border">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Category:</span>
          <div className="flex gap-1">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={[
                  'px-3 py-1.5 text-xs font-body rounded transition-colors',
                  categoryFilter === cat
                    ? 'bg-accent text-white'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Status:</span>
          <div className="flex gap-1">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={[
                  'px-3 py-1.5 text-xs font-body rounded transition-colors',
                  statusFilter === status
                    ? 'bg-accent text-white'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover',
                ].join(' ')}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-2xl font-display font-bold text-text-primary">
            {blogs.length}
          </p>
          <p className="text-xs text-text-muted">Total Posts</p>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-2xl font-display font-bold text-success">
            {blogs.filter((b) => b.published).length}
          </p>
          <p className="text-xs text-text-muted">Published</p>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-2xl font-display font-bold text-warning">
            {blogs.filter((b) => !b.published).length}
          </p>
          <p className="text-xs text-text-muted">Drafts</p>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-2xl font-display font-bold text-accent">
            {blogs.filter((b) => b.featured).length}
          </p>
          <p className="text-xs text-text-muted">Featured</p>
        </div>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-muted">No blog posts found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Tags
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Reading Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Created
                </th>
                <th className="text-right px-4 py-3 text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-body font-medium text-text-primary line-clamp-1">
                        {blog.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        /{blog.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        blog.category === 'Tech'
                          ? 'accent'
                          : blog.category === 'DSA'
                          ? 'warning'
                          : blog.category === 'Life'
                          ? 'success'
                          : 'default'
                      }
                    >
                      {blog.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(blog.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs bg-bg-secondary text-text-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {(blog.tags || []).length > 3 && (
                        <span className="text-xs text-text-muted">
                          +{blog.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {blog.published ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="default">Draft</Badge>
                      )}
                      {blog.featured && (
                        <Badge variant="accent">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <Clock className="w-4 h-4" />
                      {blog.reading_time} min
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <Calendar className="w-4 h-4" />
                      {formatDate(blog.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(blog)}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {previewUrl && (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-text-muted hover:text-accent transition-colors rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(blog)}
                        title="Delete"
                        className="hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
        size="xl"
      >
        <div className="space-y-6">
          {/* Preview Banner */}
          {showPreview && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded">
              <p className="text-sm text-accent font-medium mb-2">Preview Mode</p>
              <p className="text-xs text-text-muted">
                You are previewing the rendered content. Close preview to continue editing.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="mt-2"
              >
                Back to Edit
              </Button>
            </div>
          )}

          {!showPreview ? (
            <>
              {/* Title */}
              <Input
                label="Title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                error={formErrors.title}
                placeholder="Enter blog post title"
              />

              {/* Slug */}
              <Input
                label="Slug"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                }
                error={formErrors.slug}
                hint="URL-friendly identifier (e.g., my-first-post)"
                placeholder="my-first-post"
              />

              {/* Excerpt */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-body font-medium text-text-secondary">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Brief description of the post (shown in listings)"
                  rows={3}
                  className="w-full px-3 py-2 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 resize-none"
                />
              </div>

              {/* Content */}
              <MarkdownEditor
                label="Content"
                value={formData.content}
                onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                placeholder="Write your blog post content in Markdown..."
                minHeight="350px"
              />

              {/* Cover Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-body font-medium text-text-secondary">
                  Cover Image
                </label>
                <ImageUploader
                  bucket="portfolio-media"
                  folder="blogs"
                  value={formData.cover_image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, cover_image: '' }))}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-body font-medium text-text-secondary">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 font-body text-sm bg-surface border border-border rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <TagsInput
                value={formData.tags}
                onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              />

              {/* Featured and Published */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-body text-text-primary">
                    <Star className="w-4 h-4 inline mr-1" />
                    Featured Post
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, published: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-body text-text-primary">
                    Published
                  </span>
                </label>
              </div>

              {/* Reading Time Info */}
              <p className="text-xs text-text-muted">
                Estimated reading time: {calculateReadingTime(formData.content)} min
              </p>
            </>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded"
                />
              )}
              <div>
                <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                  {formData.title || 'Untitled'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <Badge variant="accent">{formData.category}</Badge>
                  <span>{calculateReadingTime(formData.content)} min read</span>
                  {formData.published && <Badge variant="success">Published</Badge>}
                </div>
              </div>
              {formData.excerpt && (
                <p className="text-lg text-text-secondary font-body italic">
                  {formData.excerpt}
                </p>
              )}
              <div className="prose prose-editorial max-w-none">
                {formData.content ? (
                  <pre className="whitespace-pre-wrap font-sans text-text-primary">
                    {formData.content}
                  </pre>
                ) : (
                  <p className="text-text-faint italic">No content yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              {!showPreview && formData.content && (
                <Button variant="ghost" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              {!showPreview && (
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={
          <span>
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">"{deleteTarget?.title}"</strong>? This
            action cannot be undone.
          </span>
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}
