'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ExternalLink, Github, Star, Calendar, ArrowUpDown, CheckSquare, Square, Trash2 as BulkDelete } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useToast } from '@/components/ui/Toast';

interface TechnicalDecision {
  decision: string;
  rationale: string;
  trade_off: string;
}

interface Outcome {
  outcome: string;
  result: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  role?: string;
  problem?: string;
  approach?: string;
  technical_decisions?: TechnicalDecision[];
  outcomes?: Outcome[];
  technologies?: string[];
  demo_url?: string;
  repo_url?: string;
  cover_image?: string;
  gallery?: string[];
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

type FilterTab = 'all' | 'published' | 'draft';

interface ProjectFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  role: string;
  problem: string;
  approach: string;
  technical_decisions: TechnicalDecision[];
  outcomes: Outcome[];
  technologies: string;
  demo_url: string;
  repo_url: string;
  cover_image: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  display_order: number;
}

const initialFormData: ProjectFormData = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  role: '',
  problem: '',
  approach: '',
  technical_decisions: [],
  outcomes: [],
  technologies: '',
  demo_url: '',
  repo_url: '',
  cover_image: '',
  gallery: [],
  featured: false,
  published: false,
  display_order: 0,
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'delete'>('publish');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      toast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) => {
    if (filter === 'published') return p.published;
    if (filter === 'draft') return !p.published;
    return true;
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      short_description: project.short_description || '',
      description: project.description || '',
      role: project.role || '',
      problem: project.problem || '',
      approach: project.approach || '',
      technical_decisions: project.technical_decisions || [],
      outcomes: project.outcomes || [],
      technologies: project.technologies?.join(', ') || '',
      demo_url: project.demo_url || '',
      repo_url: project.repo_url || '',
      cover_image: project.cover_image || '',
      gallery: project.gallery || [],
      featured: project.featured,
      published: project.published,
      display_order: project.display_order || 0,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleTitleChange = (value: string) => {
    const shouldAutoGenerateSlug = !formData.slug || formData.slug === generateSlug(formData.title);
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: shouldAutoGenerateSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    const autoGenerated = generateSlug(formData.title);
    const wasAutoGenerated = !formData.slug || formData.slug === autoGenerated;
    setFormData((prev) => ({
      ...prev,
      slug: wasAutoGenerated ? generateSlug(value) : prev.slug,
    }));
  };

  const addTechnicalDecision = () => {
    setFormData((prev) => ({
      ...prev,
      technical_decisions: [...prev.technical_decisions, { decision: '', rationale: '', trade_off: '' }],
    }));
  };

  const updateTechnicalDecision = (index: number, field: keyof TechnicalDecision, value: string) => {
    setFormData((prev) => ({
      ...prev,
      technical_decisions: prev.technical_decisions.map((td, i) =>
        i === index ? { ...td, [field]: value } : td
      ),
    }));
  };

  const removeTechnicalDecision = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technical_decisions: prev.technical_decisions.filter((_, i) => i !== index),
    }));
  };

  const addOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      outcomes: [...prev.outcomes, { outcome: '', result: '' }],
    }));
  };

  const updateOutcome = (index: number, field: keyof Outcome, value: string) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: prev.outcomes.map((o, i) =>
        i === index ? { ...o, [field]: value } : o
      ),
    }));
  };

  const removeOutcome = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index),
    }));
  };

  const addGalleryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, url],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        technical_decisions: formData.technical_decisions.filter(
          (td) => td.decision.trim() || td.rationale.trim() || td.trade_off.trim()
        ),
        outcomes: formData.outcomes.filter((o) => o.outcome.trim() || o.result.trim()),
      };

      const url = editingProject ? `/api/admin/projects?id=${editingProject.id}` : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save project');
      }

      toast(`Project ${editingProject ? 'updated' : 'created'} successfully`, 'success');
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to save project', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/projects?id=${projectToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete project');

      toast('Project deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      toast('Failed to delete project', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk operations
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;

    setBulkProcessing(true);
    try {
      const res = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'projects',
          action: bulkAction,
          ids: Array.from(selectedIds),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bulk action failed');
      }

      toast(`Successfully ${bulkAction === 'delete' ? 'deleted' : bulkAction === 'publish' ? 'published' : 'unpublished'} ${data.affected} project(s)`, 'success');
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      fetchProjects();
    } catch {
      toast('Bulk action failed', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkAction('delete');
    await handleBulkAction();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary">Projects</h1>
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {(['all', 'published', 'draft'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                'px-4 py-2 text-sm font-body capitalize transition-colors relative',
                filter === tab
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              {tab}
              {filter === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-body font-medium text-accent">
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as 'publish' | 'unpublish' | 'delete')}
                className="text-sm font-body bg-surface border border-border rounded px-2 py-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
                <option value="delete">Delete</option>
              </select>
              <Button
                variant={bulkAction === 'delete' ? 'danger' : 'primary'}
                size="sm"
                onClick={bulkAction === 'delete' ? () => setShowBulkConfirm(true) : handleBulkAction}
                loading={bulkProcessing}
              >
                {bulkAction === 'delete' ? 'Delete Selected' : bulkAction === 'publish' ? 'Publish Selected' : 'Unpublish Selected'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-text-muted">No projects found</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-body font-semibold text-text-muted uppercase tracking-wider w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="p-0.5 hover:bg-bg-secondary rounded transition-colors"
                      title={selectedIds.size === filteredProjects.length ? 'Deselect all' : 'Select all'}
                    >
                      {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-accent" />
                      ) : (
                        <Square className="w-4 h-4 text-text-muted" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Technologies
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-body font-semibold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className={`hover:bg-bg-secondary/50 transition-colors ${selectedIds.has(project.id) ? 'bg-accent/5' : ''}`}>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(project.id)}
                        className="p-0.5 hover:bg-bg-secondary rounded transition-colors"
                      >
                        {selectedIds.has(project.id) ? (
                          <CheckSquare className="w-4 h-4 text-accent" />
                        ) : (
                          <Square className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {project.cover_image && (
                          <img
                            src={project.cover_image}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-body font-medium text-text-primary">
                            {project.title}
                          </div>
                          <div className="text-xs text-text-faint">{project.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="default" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <Badge variant="default" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {project.featured && (
                          <Badge variant="accent">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {project.published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="default">Draft</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-text-muted">{project.display_order}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded transition-colors"
                            title="View Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded transition-colors"
                            title="View Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProjectToDelete(project);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                          title="Delete"
                        >
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
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Awesome Project"
                required
                error={formErrors.title}
              />
              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-awesome-project"
                required
                error={formErrors.slug}
              />
            </div>
            <Textarea
              label="Short Description"
              name="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
              placeholder="A brief summary of the project"
              className="min-h-[80px]"
            />
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed project description"
              className="min-h-[120px]"
            />
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
              Project Details
            </h3>
            <Input
              label="Role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="Full Stack Developer"
            />
            <Textarea
              label="Problem"
              name="problem"
              value={formData.problem}
              onChange={(e) => setFormData((prev) => ({ ...prev, problem: e.target.value }))}
              placeholder="What problem does this project solve?"
              className="min-h-[100px]"
            />
            <Textarea
              label="Approach"
              name="approach"
              value={formData.approach}
              onChange={(e) => setFormData((prev) => ({ ...prev, approach: e.target.value }))}
              placeholder="How was the project approached?"
              className="min-h-[100px]"
            />
          </div>

          {/* Technical Decisions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
                Technical Decisions
              </h3>
              <Button variant="ghost" size="sm" onClick={addTechnicalDecision}>
                <Plus className="w-4 h-4" />
                Add Decision
              </Button>
            </div>
            {formData.technical_decisions.length === 0 ? (
              <p className="text-sm text-text-faint">No technical decisions added yet</p>
            ) : (
              <div className="space-y-3">
                {formData.technical_decisions.map((td, index) => (
                  <div key={index} className="bg-bg-secondary rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body font-medium text-text-muted">
                        Decision {index + 1}
                      </span>
                      <button
                        onClick={() => removeTechnicalDecision(index)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Decision made"
                      value={td.decision}
                      onChange={(e) => updateTechnicalDecision(index, 'decision', e.target.value)}
                    />
                    <Input
                      placeholder="Rationale"
                      value={td.rationale}
                      onChange={(e) => updateTechnicalDecision(index, 'rationale', e.target.value)}
                    />
                    <Input
                      placeholder="Trade-offs"
                      value={td.trade_off}
                      onChange={(e) => updateTechnicalDecision(index, 'trade_off', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outcomes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
                Outcomes
              </h3>
              <Button variant="ghost" size="sm" onClick={addOutcome}>
                <Plus className="w-4 h-4" />
                Add Outcome
              </Button>
            </div>
            {formData.outcomes.length === 0 ? (
              <p className="text-sm text-text-faint">No outcomes added yet</p>
            ) : (
              <div className="space-y-3">
                {formData.outcomes.map((o, index) => (
                  <div key={index} className="bg-bg-secondary rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body font-medium text-text-muted">
                        Outcome {index + 1}
                      </span>
                      <button
                        onClick={() => removeOutcome(index)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Outcome description"
                      value={o.outcome}
                      onChange={(e) => updateOutcome(index, 'outcome', e.target.value)}
                    />
                    <Input
                      placeholder="Result"
                      value={o.result}
                      onChange={(e) => updateOutcome(index, 'result', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technologies & Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
              Technologies & Links
            </h3>
            <Input
              label="Technologies"
              name="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData((prev) => ({ ...prev, technologies: e.target.value }))}
              placeholder="React, Node.js, PostgreSQL"
              hint="Comma-separated list of technologies used"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Demo URL"
                name="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, demo_url: e.target.value }))}
                placeholder="https://example.com"
              />
              <Input
                label="Repository URL"
                name="repo_url"
                type="url"
                value={formData.repo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, repo_url: e.target.value }))}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
              Images
            </h3>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">
                Cover Image
              </label>
              <ImageUploader
                bucket="portfolio-media"
                folder="projects"
                value={formData.cover_image}
                onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
                onRemove={() => setFormData((prev) => ({ ...prev, cover_image: '' }))}
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">
                Gallery
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formData.gallery.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-24 object-cover rounded border border-border"
                    />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-surface rounded text-error hover:bg-error hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <ImageUploader
                  bucket="portfolio-media"
                  folder="projects"
                  onChange={addGalleryImage}
                  className="col-span-1"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-text-primary uppercase tracking-wide">
              Settings
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm font-body text-text-primary">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm font-body text-text-primary">Published</span>
              </label>
            </div>
            <Input
              label="Display Order"
              name="display_order"
              type="number"
              min="0"
              value={formData.display_order}
              onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-32"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={formLoading}>
            {editingProject ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Projects"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete <strong className="text-text-primary">{selectedIds.size} project(s)</strong>?</p>
            <p className="text-xs text-text-faint">This action cannot be undone.</p>
          </div>
        }
        confirmLabel="Delete Selected"
        confirmVariant="danger"
        loading={bulkProcessing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Project"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this project?</p>
            {projectToDelete && (
              <p className="font-medium text-text-primary">{projectToDelete.title}</p>
            )}
            <p className="text-xs text-text-faint">This action cannot be undone.</p>
          </div>
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
