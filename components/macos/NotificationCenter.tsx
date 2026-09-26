'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GitCommitHorizontal, Code2, BookOpen, Sparkles } from 'lucide-react';
import { nowData } from '@/data/now';
import { useActivity, useBlogs, timeAgo } from '@/components/os/data';

function Widget({ title, icon, children, href }: { title: string; icon: React.ReactNode; children: React.ReactNode; href?: string }) {
  const body = (
    <div className="rounded-[18px] mac-widget-card p-3.5 text-[13px]">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mac-text-faint mb-2">{icon}{title}</p>
      {children}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className="block">{body}</a> : body;
}

function MiniCalendar() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="text-[13px] font-semibold text-[#FF453A] mb-1.5">{now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="mac-text-faint">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className={`mx-auto w-5 h-5 leading-5 rounded-full ${d === now.getDate() ? 'bg-[#FF453A] text-white font-semibold' : ''}`}>{d ?? ''}</span>
        ))}
      </div>
    </div>
  );
}

export default function NotificationCenter({ onClose }: { onClose: () => void }) {
  const activity = useActivity();
  const { data: posts } = useBlogs();
  const gh = activity?.github;
  const lc = activity?.leetcode;
  const max = Math.max(1, ...(gh?.daily ?? [1]));

  return (
    <div className="fixed inset-0 z-[8800]" onMouseDown={onClose}>
      <motion.aside
        initial={{ x: 380 }}
        animate={{ x: 0 }}
        exit={{ x: 380 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-9 right-2 bottom-2 w-[340px] overflow-y-auto space-y-2.5 mac-text pb-4"
        aria-label="Notification Centre"
      >
        <div className="rounded-[18px] mac-widget-card p-3.5 text-[13px]">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mac-text-faint mb-1"><Sparkles className="w-3.5 h-3.5" /> RitikOS</p>
          <p className="font-semibold">Welcome to RitikOS</p>
          <p className="mac-text-muted text-[12px]">Try ⌘K for Spotlight, or open Terminal and type <code>help</code>.</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[18px] mac-widget-card p-3.5"><MiniCalendar /></div>
          <Widget title="LeetCode" icon={<Code2 className="w-3.5 h-3.5" />} href="https://leetcode.com/u/Ritik812800/">
            {lc && lc.solved > 0 ? (
              <>
                <p className="text-[28px] font-semibold leading-none">{lc.solved}</p>
                <p className="mac-text-faint text-[11px] mt-1">solved · E{lc.easy} M{lc.medium} H{lc.hard}</p>
              </>
            ) : (
              <p className="mac-text-muted text-[12px] leading-snug">Just started the DSA streak.</p>
            )}
          </Widget>
        </div>

        <Widget title="GitHub" icon={<GitCommitHorizontal className="w-3.5 h-3.5" />} href={gh?.latest?.url ?? 'https://github.com/Ritik0712-ai'}>
          {gh?.latest ? (
            <>
              <p className="font-mono text-[12px] line-clamp-2">{gh.latest.message ?? 'Pushed new work'}</p>
              <p className="mac-text-faint text-[11px] mt-0.5">{gh.latest.repo} · {timeAgo(gh.latest.at)}</p>
            </>
          ) : (
            <p className="mac-text-faint text-[12px]">Loading activity…</p>
          )}
          {gh && (
            <div className="flex items-end gap-[2px] h-8 mt-3">
              {gh.daily.map((n, i) => (
                <span key={i} className="flex-1 rounded-sm" style={{ height: `${n ? 25 + (n / max) * 75 : 10}%`, background: n ? '#30D158' : 'var(--mac-chip)' }} />
              ))}
            </div>
          )}
        </Widget>

        <Widget title="Now" icon={<Sparkles className="w-3.5 h-3.5" />}>
          <p className="font-semibold leading-snug">{nowData.focus}</p>
          <p className="mac-text-faint text-[11px] mt-1">Updated {nowData.lastUpdated}</p>
        </Widget>

        {posts?.[0] && (
          <Link href={`/blog/${posts[0].slug}`} target="_blank" className="block">
            <div className="rounded-[18px] mac-widget-card p-3.5 text-[13px]">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mac-text-faint mb-2"><BookOpen className="w-3.5 h-3.5" />Latest post</p>
              <p className="font-semibold leading-snug">{posts[0].title}</p>
              <p className="mac-text-faint text-[11px] mt-1">{timeAgo(posts[0].created_at)}</p>
            </div>
          </Link>
        )}
      </motion.aside>
    </div>
  );
}
