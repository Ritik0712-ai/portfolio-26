'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw, ChevronRight, Search, Plus, Scissors, Copy, Clipboard, Trash2, ArrowUpDown, LayoutGrid, List, MoreHorizontal, Home, Monitor, ExternalLink, PanelRight } from 'lucide-react';
import { useProjects, useTimeline, useCertifications, useBlogs, useTestimonials, useDsa, useContent, formatMonth } from '@/components/os/data';
import { Fluent, FolderGlyph, PdfGlyph } from '../meta';
import TestimonialsPanel from '@/components/os/TestimonialsPanel';
import DsaPanel from '@/components/os/DsaPanel';

export type ExplorerFolder = 'home' | 'projects' | 'experience' | 'certifications' | 'testimonials' | 'dsa' | 'documents' | 'desktop';

const NAV: { id: ExplorerFolder; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'documents', label: 'Documents' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'dsa', label: 'DSA Journal' },
];

const LABEL: Record<ExplorerFolder, string> = { home: 'Home', projects: 'Projects', experience: 'Experience', certifications: 'Certifications', testimonials: 'Testimonials', dsa: 'DSA Journal', documents: 'Documents', desktop: 'Desktop' };

interface Item {
  key: string;
  name: string;
  modified: string;
  type: string;
  size: string;
  icon: (s: number) => React.ReactNode;
  thumb?: string | null;
  open: () => void;
  details: { label: string; value: string }[];
  description?: string | null;
  link?: string | null;
}

export default function Explorer({ initial = 'home', onOpenProject, onOpenPost, onOpenResume }: {
  initial?: ExplorerFolder;
  onOpenProject: (slug: string) => void;
  onOpenPost: (slug: string) => void;
  onOpenResume: () => void;
}) {
  const [history, setHistory] = useState<ExplorerFolder[]>([initial]);
  const [pos, setPos] = useState(0);
  const [view, setView] = useState<'details' | 'tiles'>('details');
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [pane, setPane] = useState(true);
  const folder = history[pos];

  useEffect(() => { setHistory([initial]); setPos(0); }, [initial]);
  useEffect(() => { setSelected(null); setQ(''); }, [folder]);

  const go = (f: ExplorerFolder) => {
    if (f === folder) return;
    const h = [...history.slice(0, pos + 1), f];
    setHistory(h);
    setPos(h.length - 1);
  };

  const { data: projects } = useProjects();
  const { data: timeline } = useTimeline();
  const { data: certs } = useCertifications();
  const { data: posts } = useBlogs();
  const { data: testimonials } = useTestimonials();
  const { data: dsa } = useDsa();
  const has = useContent();
  // Folders with nothing in them are hidden; they appear live once content is published.
  const visible = (f: ExplorerFolder) => !(f === 'projects' || f === 'experience' || f === 'certifications' || f === 'testimonials' || f === 'dsa') || has[f];

  const folderItem = (f: ExplorerFolder, count?: number): Item => ({
    key: `f-${f}`,
    name: LABEL[f],
    modified: '',
    type: 'File folder',
    size: count !== undefined ? `${count} items` : '',
    icon: (s) => <FolderGlyph size={s} />,
    open: () => go(f),
    details: [{ label: 'Type', value: 'File folder' }, ...(count !== undefined ? [{ label: 'Contains', value: `${count} items` }] : [])],
  });

  const items: Item[] | undefined = useMemo(() => {
    switch (folder) {
      case 'home':
      case 'desktop':
        return [
          folderItem('projects', projects?.length),
          folderItem('experience', timeline?.length),
          folderItem('certifications', certs?.length),
          folderItem('testimonials', testimonials?.length),
          folderItem('dsa', dsa?.length),
          folderItem('documents'),
        ].filter((i) => visible(i.key.slice(2) as ExplorerFolder));
      case 'documents':
        return [
          {
            key: 'resume', name: 'Ritik_Agarwal_Resume.pdf', modified: '', type: 'PDF document', size: '', icon: (s) => <PdfGlyph size={s} />, open: onOpenResume,
            details: [{ label: 'Type', value: 'PDF document' }], description: 'My résumé — double-click to open, or download it from the viewer.',
          },
          ...(posts ?? []).map((p) => ({
            key: p.id, name: `${p.title}.md`, modified: new Date(p.created_at).toLocaleDateString('en-IN'), type: 'Blog post', size: p.reading_time ?? '',
            icon: (s: number) => <Fluent name="document_48_color" size={s} />, open: () => onOpenPost(p.slug), thumb: p.cover_image,
            details: [{ label: 'Category', value: p.category }, { label: 'Published', value: new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }],
            description: p.excerpt,
          })),
        ];
      case 'projects':
        return projects?.map((p) => ({
          key: p.id, name: p.title, modified: new Date(p.updated_at || p.created_at).toLocaleDateString('en-IN'), type: p.featured ? 'Featured project' : 'Project',
          size: `${p.technologies?.length ?? 0} tech`, icon: (s: number) => <FolderGlyph size={s} />, thumb: p.cover_image, open: () => onOpenProject(p.slug),
          details: [{ label: 'Role', value: p.role ?? '—' }, { label: 'Stack', value: (p.technologies ?? []).slice(0, 6).join(', ') }],
          description: p.short_description, link: p.demo_url || p.repo_url,
        }));
      case 'experience':
        return timeline?.map((e) => ({
          key: e.id, name: e.title, modified: formatMonth(e.event_date), type: 'Milestone', size: '',
          icon: (s: number) => <Fluent name="briefcase_48_color" size={s} />, open: () => setSelected(e.id),
          details: [{ label: 'Date', value: formatMonth(e.event_date) }], description: e.description,
        }));
      case 'testimonials':
        return testimonials?.map((t) => ({
          key: t.id, name: t.name, modified: new Date(t.created_at).toLocaleDateString('en-IN'), type: 'Testimonial',
          size: t.rating ? `${t.rating}★` : '', icon: (s: number) => <Fluent name="chat_48_color" size={s} />, open: () => setSelected(t.id),
          details: [...(t.role || t.company ? [{ label: 'Role', value: [t.role, t.company].filter(Boolean).join(' · ') }] : [])],
          description: `“${t.content}”`,
        }));
      case 'dsa':
        return dsa?.map((p) => ({
          key: p.id, name: p.title, modified: p.solved_at, type: p.difficulty ?? 'Problem', size: p.time_complexity ?? '',
          icon: (s: number) => <Fluent name="code_block_48_color" size={s} />, open: () => setSelected(p.id),
          details: [], description: null,
        }));
      case 'certifications':
        return certs?.map((c) => ({
          key: c.id, name: c.title, modified: c.issue_date ? formatMonth(c.issue_date) : '', type: c.issuer, size: '',
          icon: (s: number) => <Fluent name="ribbon_star_32_color" size={s} />, thumb: c.image_url,
          open: () => (c.credential_url ? window.open(c.credential_url, '_blank', 'noopener') : setSelected(c.id)),
          details: [{ label: 'Issuer', value: c.issuer }, ...(c.issue_date ? [{ label: 'Issued', value: formatMonth(c.issue_date) }] : [])],
          link: c.credential_url,
        }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, projects, timeline, certs, posts, testimonials, has.projects, has.experience, has.certifications, has.testimonials]);

  const shown = (items ?? []).filter((i) => !q.trim() || i.name.toLowerCase().includes(q.trim().toLowerCase()));
  const sel = shown.find((i) => i.key === selected);

  const crumb = folder === 'home' ? ['Home'] : ['This PC', LABEL[folder]];

  return (
    <div className="flex flex-col h-full text-[13px]">
      {/* Address bar */}
      <div className="flex items-center gap-1 px-2 h-12 win-mica shrink-0">
        <IconBtn label="Back" disabled={pos === 0} onClick={() => setPos(pos - 1)}><ArrowLeft className="w-4 h-4" /></IconBtn>
        <IconBtn label="Forward" disabled={pos >= history.length - 1} onClick={() => setPos(pos + 1)}><ArrowRight className="w-4 h-4" /></IconBtn>
        <IconBtn label="Up" disabled={folder === 'home'} onClick={() => go('home')}><ArrowUp className="w-4 h-4" /></IconBtn>
        <IconBtn label="Refresh" onClick={() => setSelected(null)}><RotateCw className="w-3.5 h-3.5" /></IconBtn>
        <div className="flex-1 h-8 mx-1 rounded-md win-card flex items-center gap-1 px-2 min-w-0">
          {folder === 'home' ? <Home className="w-4 h-4 shrink-0" /> : <Monitor className="w-4 h-4 shrink-0" />}
          {crumb.map((c, i) => (
            <span key={c} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 win-text-2 shrink-0" />
              <button onClick={() => (i === 0 && folder !== 'home' ? go('home') : undefined)} className="px-1 rounded win-hover truncate">{c}</button>
            </span>
          ))}
        </div>
        <label className="w-56 h-8 rounded-md win-card flex items-center gap-2 px-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${LABEL[folder]}`} aria-label="Search this folder" className="flex-1 min-w-0 bg-transparent outline-none placeholder:win-text-2" />
          <Search className="w-3.5 h-3.5 win-text-2" />
        </label>
      </div>

      {/* Command bar */}
      <div className="flex items-center gap-1 px-3 h-11 border-b win-stroke win-mica shrink-0">
        <button className="win-btn-accent inline-flex items-center gap-1.5 text-[12px]" disabled title="This is a read-only portfolio"><Plus className="w-4 h-4" /> New</button>
        <span className="w-px h-6 bg-[var(--win-stroke)] mx-1" />
        {[Scissors, Copy, Clipboard, Trash2].map((I, i) => (
          <span key={i} className="w-8 h-8 flex items-center justify-center opacity-35"><I className="w-4 h-4" /></span>
        ))}
        <span className="w-px h-6 bg-[var(--win-stroke)] mx-1" />
        <span className="h-8 px-2 flex items-center gap-1.5 opacity-60"><ArrowUpDown className="w-4 h-4" /> Sort</span>
        <button onClick={() => setView(view === 'details' ? 'tiles' : 'details')} className="h-8 px-2 rounded-md win-hover flex items-center gap-1.5">
          {view === 'details' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />} View
        </button>
        <span className="w-8 h-8 flex items-center justify-center opacity-60"><MoreHorizontal className="w-4 h-4" /></span>
        <button onClick={() => setPane(!pane)} aria-pressed={pane} className="ml-auto h-8 px-2 rounded-md win-hover flex items-center gap-1.5">
          <PanelRight className="w-4 h-4" /> Details
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Navigation pane */}
        <nav aria-label="Navigation pane" className="w-52 shrink-0 border-r win-stroke overflow-y-auto win-scroll py-2 px-1.5 win-mica">
          <NavRow active={folder === 'home'} onClick={() => go('home')} icon={<Fluent name="home_48_color" size={16} />}>Home</NavRow>
          <NavRow onClick={() => onOpenResume()} icon={<PdfGlyph size={16} />}>Resume.pdf</NavRow>
          <div className="my-2 border-t win-stroke" />
          {NAV.filter((n) => visible(n.id)).map((n) => (
            <NavRow key={n.id} active={folder === n.id} onClick={() => go(n.id)} icon={<FolderGlyph size={16} />}>{n.label}</NavRow>
          ))}
          <div className="my-2 border-t win-stroke" />
          <NavRow onClick={() => {}} icon={<Monitor className="w-4 h-4 text-[#3A96DD]" />}>This PC</NavRow>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-y-auto win-scroll" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          {folder === 'home' && (
            <p className="px-4 pt-3 pb-1 text-[12px] font-semibold">Quick access</p>
          )}
          {folder === 'testimonials' && !q ? (
            <TestimonialsPanel accent="var(--win-accent)" />
          ) : folder === 'dsa' ? (
            <DsaPanel accent="var(--win-accent)" />
          ) : !items ? (
            <p className="p-4 win-text-2">Working on it…</p>
          ) : shown.length === 0 ? (
            <p className="p-6 text-center win-text-2">{q ? 'No items match your search.' : 'This folder is empty.'}</p>
          ) : view === 'tiles' || folder === 'home' ? (
            <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
              {shown.map((i) => (
                <button
                  key={i.key}
                  onClick={() => setSelected(i.key)}
                  onDoubleClick={i.open}
                  className={`flex flex-col items-center gap-2 p-3 rounded-md text-center border ${selected === i.key ? 'bg-[var(--win-hover)] border-[var(--win-stroke)]' : 'border-transparent win-hover'}`}
                >
                  {i.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.thumb} alt="" className="w-full aspect-video object-cover object-top rounded border win-stroke" />
                  ) : (
                    <span className="h-[72px] flex items-center">{i.icon(64)}</span>
                  )}
                  <span className="text-[12px] leading-tight line-clamp-2">{i.name}</span>
                  {folder === 'home' && i.size && <span className="text-[11px] win-text-2 -mt-1">{i.size}</span>}
                </button>
              ))}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 win-solid">
                <tr className="text-[12px] win-text-2">
                  <th className="font-normal pl-4 py-2 w-[46%]">Name</th>
                  <th className="font-normal py-2">Date modified</th>
                  <th className="font-normal py-2">Type</th>
                  <th className="font-normal py-2 pr-4">Size</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <tr
                    key={i.key}
                    onClick={() => setSelected(i.key)}
                    onDoubleClick={i.open}
                    className={`cursor-default ${selected === i.key ? 'bg-[var(--win-hover)] outline outline-1 outline-[var(--win-stroke)]' : 'hover:bg-[var(--win-hover)]'}`}
                  >
                    <td className="pl-4 py-1.5"><span className="flex items-center gap-2 min-w-0">{i.icon(18)}<span className="truncate">{i.name}</span></span></td>
                    <td className="py-1.5 win-text-2 whitespace-nowrap pr-3">{i.modified}</td>
                    <td className="py-1.5 win-text-2 whitespace-nowrap pr-3 truncate max-w-[160px]">{i.type}</td>
                    <td className="py-1.5 pr-4 win-text-2 whitespace-nowrap">{i.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details pane */}
        {pane && (
          <aside aria-label="Details pane" className="w-64 shrink-0 border-l win-stroke overflow-y-auto win-scroll p-4">
            {sel ? (
              <>
                <div className="flex justify-center mb-3">
                  {sel.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sel.thumb} alt="" className="w-full rounded border win-stroke" />
                  ) : (
                    sel.icon(96)
                  )}
                </div>
                <p className="text-[15px] font-semibold mb-2 break-words">{sel.name}</p>
                {sel.description && <p className="text-[12px] win-text-2 leading-relaxed mb-3 whitespace-pre-line">{sel.description}</p>}
                <dl className="text-[12px] space-y-1.5 mb-4">
                  {sel.details.map((d) => (
                    <div key={d.label}><dt className="win-text-2">{d.label}</dt><dd>{d.value}</dd></div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2">
                  {folder !== 'experience' && <button onClick={sel.open} className="win-btn-accent text-[12px]">Open</button>}
                  {sel.link && (
                    <a href={sel.link} target="_blank" rel="noopener noreferrer" className="win-btn text-[12px] inline-flex items-center gap-1">Link <ExternalLink className="w-3 h-3" /></a>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center win-text-2 text-[12px] gap-2">
                <FolderGlyph size={56} open />
                Select a file to see its details.
              </div>
            )}
          </aside>
        )}
      </div>

      <div className="h-6 px-4 flex items-center text-[11px] win-text-2 border-t win-stroke shrink-0">
        {items ? `${shown.length} item${shown.length === 1 ? '' : 's'}` : ''}{sel ? ' · 1 item selected' : ''}
      </div>
    </div>
  );
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button aria-label={label} disabled={disabled} onClick={onClick} className="w-8 h-8 rounded-md win-hover flex items-center justify-center disabled:opacity-35 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}

function NavRow({ active, onClick, icon, children }: { active?: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative w-full flex items-center gap-2.5 h-8 px-3 rounded-md text-left ${active ? 'bg-[var(--win-hover)]' : 'win-hover'}`}>
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--win-accent)]" />}
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}
