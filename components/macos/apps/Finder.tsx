'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, FolderClosed, Briefcase, Award, FileText, ExternalLink, Github, MessageSquareQuote, Code2 } from 'lucide-react';
import { useProjects, useTimeline, useCertifications, useTestimonials, useDsa, useContent, formatMonth } from '@/components/os/data';
import TestimonialsPanel from '@/components/os/TestimonialsPanel';
import DsaPanel from '@/components/os/DsaPanel';
import type { Project } from '@/types';
import { FolderIcon, DocIcon } from '../icons';

export type FinderFolder = 'projects' | 'experience' | 'certifications' | 'testimonials' | 'dsa' | 'documents';

const SIDEBAR: { id: FinderFolder; label: string; icon: typeof FolderClosed }[] = [
  { id: 'projects', label: 'Projects', icon: FolderClosed },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'dsa', label: 'DSA Journal', icon: Code2 },
  { id: 'documents', label: 'Documents', icon: FileText },
];

export default function Finder({
  initialFolder = 'projects',
  onOpenResume,
}: {
  initialFolder?: FinderFolder;
  onOpenResume: () => void;
}) {
  const [folder, setFolder] = useState<FinderFolder>(initialFolder);
  const [selected, setSelected] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  // Live data: new/edited content appears without reopening the window.
  const { data: projects } = useProjects();
  const { data: timeline } = useTimeline();
  const { data: certs } = useCertifications();
  const { data: testimonials } = useTestimonials();
  const { data: dsa } = useDsa();
  const has = useContent();
  // Sections with nothing in them are hidden (Documents always has the résumé).
  const sidebar = SIDEBAR.filter((s) => s.id === 'documents' || has[s.id]);

  useEffect(() => setFolder(initialFolder), [initialFolder]);
  useEffect(() => {
    setSelected(null);
    setOpenProject(null);
  }, [folder]);
  // Keep an open project in sync with edits made in the admin.
  useEffect(() => {
    if (openProject) setOpenProject(projects?.find((p) => p.id === openProject.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const count =
    folder === 'projects' ? projects?.length : folder === 'experience' ? timeline?.length : folder === 'certifications' ? certs?.length : folder === 'testimonials' ? testimonials?.length : folder === 'dsa' ? dsa?.length : 1;

  return (
    <div className="flex h-full text-[13px] mac-text">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 mac-sidebar px-2 py-3 overflow-y-auto">
        <p className="px-2 mb-1 text-[11px] font-semibold mac-text-faint">Favourites</p>
        {sidebar.map((s) => (
          <button
            key={s.id}
            onClick={() => setFolder(s.id)}
            className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left ${folder === s.id ? 'mac-sidebar-active' : 'mac-hover'}`}
          >
            <s.icon className="w-4 h-4 text-[#2E86EA]" />
            {s.label}
          </button>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 h-10 px-4 border-b mac-divider shrink-0">
          {openProject && (
            <button onClick={() => setOpenProject(null)} aria-label="Back" className="p-1 rounded mac-hover">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <p className="font-semibold capitalize">{openProject ? openProject.title : folder}</p>
        </div>

        <div className="flex-1 overflow-y-auto" onClick={() => setSelected(null)}>
          {openProject ? (
            <ProjectPreview project={openProject} />
          ) : folder === 'projects' ? (
            <Grid loading={!projects}>
              {projects?.map((p) => (
                <Item
                  key={p.id}
                  label={p.title}
                  selected={selected === p.id}
                  onSelect={() => setSelected(p.id)}
                  onOpen={() => setOpenProject(p)}
                  icon={
                    p.cover_image ? (
                      <div className="relative w-24 h-16 rounded-md overflow-hidden shadow-md bg-black/10">
                        <Image src={p.cover_image} alt="" fill sizes="96px" className="object-cover object-top" />
                      </div>
                    ) : (
                      <FolderIcon size={64} />
                    )
                  }
                />
              ))}
            </Grid>
          ) : folder === 'experience' ? (
            <table className="w-full text-left">
              <thead className="text-[11px] mac-text-faint border-b mac-divider">
                <tr>
                  <th className="font-medium px-4 py-1.5">Name</th>
                  <th className="font-medium px-4 py-1.5 w-32">Date</th>
                </tr>
              </thead>
              <tbody>
                {(timeline ?? []).map((t, i) => (
                  <tr key={t.id} className={i % 2 ? 'mac-row-alt' : ''}>
                    <td className="px-4 py-2">
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="mac-text-faint text-[12px]">{t.description}</p>}
                    </td>
                    <td className="px-4 py-2 mac-text-faint whitespace-nowrap align-top">{formatMonth(t.event_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : folder === 'certifications' ? (
            <Grid loading={!certs}>
              {certs?.map((c) => (
                <Item
                  key={c.id}
                  label={c.title}
                  sub={c.issuer}
                  selected={selected === c.id}
                  onSelect={() => setSelected(c.id)}
                  onOpen={() => c.credential_url && window.open(c.credential_url, '_blank', 'noopener,noreferrer')}
                  icon={
                    c.image_url ? (
                      <img src={c.image_url} alt="" className="w-16 h-16 object-contain rounded-md bg-white shadow" />
                    ) : (
                      <DocIcon size={60} label="CERT" />
                    )
                  }
                />
              ))}
            </Grid>
          ) : folder === 'testimonials' ? (
            <TestimonialsPanel accent="#2E6BD9" />
          ) : folder === 'dsa' ? (
            <DsaPanel accent="#2E6BD9" />
          ) : (
            <Grid loading={false}>
              <Item
                label="Ritik_Agarwal_Resume.pdf"
                selected={selected === 'resume'}
                onSelect={() => setSelected('resume')}
                onOpen={onOpenResume}
                icon={<DocIcon size={64} />}
              />
            </Grid>
          )}
        </div>

        <div className="h-7 border-t mac-divider px-4 flex items-center text-[11px] mac-text-faint shrink-0">
          {openProject ? 'Quick Look' : `${count ?? '…'} item${count === 1 ? '' : 's'} · double-click to open`}
        </div>
      </div>
    </div>
  );
}

function Grid({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  if (loading) return <p className="p-6 mac-text-faint">Loading…</p>;
  if (Array.isArray(children) && children.length === 0) return <p className="p-6 mac-text-faint">This folder is empty.</p>;
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-4">{children}</div>;
}

function Item({
  icon, label, sub, selected, onSelect, onOpen,
}: {
  icon: React.ReactNode; label: string; sub?: string; selected: boolean; onSelect: () => void; onOpen: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="flex flex-col items-center gap-1.5 p-2 rounded-lg text-center focus:outline-none"
    >
      <div className={`p-1.5 rounded-md ${selected ? 'mac-select-bg' : ''}`}>{icon}</div>
      <span className={`px-1.5 rounded text-[12px] leading-tight line-clamp-2 ${selected ? 'bg-[#2E6BD9] text-white' : ''}`}>{label}</span>
      {sub && <span className="text-[11px] mac-text-faint -mt-1">{sub}</span>}
    </button>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="p-6 max-w-2xl">
      {project.cover_image && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-5 bg-black/10">
          <Image src={project.cover_image} alt={project.title} fill sizes="640px" className="object-cover object-top" />
        </div>
      )}
      <h2 className="text-xl font-semibold mb-1">{project.title}</h2>
      {project.short_description && <p className="mac-text-muted leading-relaxed mb-4">{project.short_description}</p>}
      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md mac-chip text-[11px]">{t}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="mac-btn-primary">
          Read case study
        </a>
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="mac-btn inline-flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> Live demo
          </a>
        )}
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="mac-btn inline-flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" /> Source
          </a>
        )}
      </div>
    </div>
  );
}
