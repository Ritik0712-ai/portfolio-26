'use client';

import { motion } from 'framer-motion';
import { useActivity, useBlogs, useGitHub, useProjects, useTestimonials, PROFILE, timeAgo } from '@/components/os/data';
import { nowData } from '@/data/now';
import { Fluent, FolderGlyph, WIN_APPS } from './meta';
import { musicPicks } from '@/data/music';

// Widgets board — slides in from the left like Windows 11's, but every card
// is live portfolio data instead of news and weather.
export default function Widgets({ onOpen, onClose, onTestimonials }: { onOpen: (what: 'github' | 'notepad' | 'music' | { post: string } | { project: string }) => void; onClose: () => void; onTestimonials: () => void }) {
  const gh = useGitHub();
  const activity = useActivity();
  const { data: posts } = useBlogs();
  const { data: projects } = useProjects();
  const { data: testimonials } = useTestimonials();
  const quote = testimonials?.[0];
  const now = new Date();
  const featured = (projects ?? []).find((p) => p.featured && p.cover_image) ?? (projects ?? []).find((p) => p.cover_image);
  const daily = activity?.github?.daily ?? [];
  const max = Math.max(1, ...daily);
  const lc = activity?.leetcode;

  const card = 'rounded-lg win-card p-4 text-left win-hover transition-colors';

  return (
    <motion.aside
      aria-label="Widgets"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 480, damping: 42 }}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed left-3 top-3 bottom-[58px] z-[9100] w-[min(760px,calc(100vw-24px))] rounded-lg win-acrylic win-text flex flex-col overflow-hidden"
    >
      <header className="flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <p className="text-[22px] font-semibold tabular-nums">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p>
          <p className="text-[12px] win-text-2">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 px-2 py-1 rounded-md win-hover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto win-scroll px-6 pb-6 grid grid-cols-2 gap-3 content-start">
        <button onClick={() => onOpen('notepad')} className={`${card} row-span-2`}>
          <p className="flex items-center gap-2 text-[12px] win-text-2 mb-3"><Fluent name="lightbulb_48_color" size={16} /> Now · {nowData.lastUpdated}</p>
          <p className="text-[16px] font-semibold leading-snug mb-3">{nowData.focus}</p>
          <p className="text-[11px] uppercase tracking-wider win-text-2 mb-1">Building</p>
          <ul className="text-[12px] space-y-1.5 mb-3 list-disc pl-4">
            {nowData.currentlyBuilding.slice(0, 2).map((b) => <li key={b} className="line-clamp-2">{b}</li>)}
          </ul>
          <p className="text-[11px] uppercase tracking-wider win-text-2 mb-1">Reading</p>
          <p className="text-[12px] line-clamp-2">{nowData.currentlyReading[0]}</p>
        </button>

        <button onClick={() => onOpen('github')} className={card}>
          <p className="flex items-center gap-2 text-[12px] win-text-2 mb-2">
            <Fluent name="code_block_48_color" size={16} /> GitHub
            <span className="ml-auto inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#6CCB5F] animate-pulse" /> Live</span>
          </p>
          <div className="flex items-end gap-5 mb-3">
            <div><p className="text-[26px] font-semibold leading-none">{gh?.repos.total ?? '—'}</p><p className="text-[11px] win-text-2 mt-1">repositories</p></div>
            <div><p className="text-[26px] font-semibold leading-none">{gh?.contributions?.totalLastYear ?? '—'}</p><p className="text-[11px] win-text-2 mt-1">contributions / yr</p></div>
          </div>
          <div className="flex items-end gap-[3px] h-10" aria-label="Activity, last 30 days">
            {(daily.length ? daily : Array(30).fill(0)).map((v: number, i: number) => (
              <span key={i} className="flex-1 rounded-sm bg-[var(--win-accent)]" style={{ height: `${Math.max(8, (v / max) * 100)}%`, opacity: v ? 0.9 : 0.18 }} />
            ))}
          </div>
          {activity?.github?.latest && <p className="text-[11px] win-text-2 mt-2 truncate">Last push: {activity.github.latest.repo} · {timeAgo(activity.github.latest.at)}</p>}
        </button>

        <a href={PROFILE.leetcode} target="_blank" rel="noopener noreferrer" className={card}>
          <p className="flex items-center gap-2 text-[12px] win-text-2 mb-2"><Fluent name="trophy_48_color" size={16} /> LeetCode</p>
          <p className="text-[26px] font-semibold leading-none">{lc ? lc.solved : '—'}</p>
          <p className="text-[11px] win-text-2 mt-1">problems solved</p>
          {lc && (
            <div className="flex gap-3 mt-3 text-[11px]">
              <span className="text-[#2E9E6A]">Easy {lc.easy}</span>
              <span className="text-[#C88A04]">Medium {lc.medium}</span>
              <span className="text-[#D13438]">Hard {lc.hard}</span>
            </div>
          )}
        </a>

        {featured && (
          <button onClick={() => onOpen({ project: featured.slug })} className={`${card} !p-0 overflow-hidden col-span-2 flex`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover_image!} alt="" className="w-[44%] aspect-video object-cover object-top" />
            <span className="p-4 min-w-0">
              <span className="flex items-center gap-2 text-[12px] win-text-2 mb-2"><FolderGlyph size={16} /> Featured project</span>
              <span className="block text-[16px] font-semibold mb-1">{featured.title}</span>
              <span className="block text-[12px] win-text-2 line-clamp-3">{featured.short_description}</span>
            </span>
          </button>
        )}

        {quote && (
          <button onClick={onTestimonials} className={`${card} col-span-2`}>
            <p className="flex items-center gap-2 text-[12px] win-text-2 mb-2">
              <Fluent name="chat_48_color" size={16} /> Testimonials{testimonials!.length > 1 ? ` · ${testimonials!.length}` : ''}
            </p>
            <p className="text-[14px] leading-relaxed line-clamp-3">&ldquo;{quote.content}&rdquo;</p>
            <p className="text-[12px] win-text-2 mt-2">— {quote.name}{quote.role || quote.company ? `, ${[quote.role, quote.company].filter(Boolean).join(' · ')}` : ''}</p>
          </button>
        )}

        {(posts ?? []).slice(0, 2).map((p) => (
          <button key={p.id} onClick={() => onOpen({ post: p.slug })} className={card}>
            <p className="flex items-center gap-2 text-[12px] win-text-2 mb-2"><Fluent name="book_open_48_color" size={16} /> Blog · {timeAgo(p.created_at)}</p>
            <p className="text-[14px] font-semibold leading-snug line-clamp-2">{p.title}</p>
            {p.excerpt && <p className="text-[12px] win-text-2 mt-1 line-clamp-2">{p.excerpt}</p>}
          </button>
        ))}

        <button onClick={() => onOpen('music')} className={`${card} col-span-2 flex items-center gap-3`}>
          {WIN_APPS.music.icon(32)}
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">On repeat while coding</span>
            <span className="block text-[12px] win-text-2">{musicPicks.slice(0, 3).map((m) => m.title).join(' · ')}</span>
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
