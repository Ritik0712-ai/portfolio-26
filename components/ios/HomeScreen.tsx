'use client';

import { motion } from 'framer-motion';
import { Search, GitCommitHorizontal, Code2 } from 'lucide-react';
import StatusBar from './StatusBar';
import { IOS_APPS, HOME_GRID, HOME_DOCK, type IOSAppId } from './apps-meta';
import { nowData } from '@/data/now';
import { useActivity, timeAgo } from '@/components/os/data';

export default function HomeScreen({
  wallpaper, onOpen, onSearch, hiddenApps,
}: {
  wallpaper: string;
  onOpen: (id: IOSAppId, rect: DOMRect) => void;
  onSearch: () => void;
  hiddenApps: Set<IOSAppId>;
}) {
  const activity = useActivity();
  const gh = activity?.github;
  const lc = activity?.leetcode;
  const max = Math.max(1, ...(gh?.daily ?? [1]));

  const icon = (id: IOSAppId, label = true) => (
    <button
      key={id}
      onClick={(e) => onOpen(id, e.currentTarget.getBoundingClientRect())}
      className="flex flex-col items-center gap-[5px] active:scale-90 transition-transform duration-150"
      aria-label={IOS_APPS[id].name}
    >
      <span className={hiddenApps.has(id) ? 'opacity-0' : ''}>{IOS_APPS[id].icon(60)}</span>
      {label && <span className="text-[11.5px] text-white leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] truncate max-w-[72px]">{IOS_APPS[id].name}</span>}
    </button>
  );

  return (
    <motion.div
      className={`fixed inset-0 mac-wallpaper-${wallpaper} overflow-hidden select-none`}
      initial={{ scale: 1.08, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      <StatusBar tone="light" />
      <div className="absolute inset-x-0 top-[62px] bottom-[120px] overflow-y-auto px-[22px]">
        {/* Widgets */}
        <div className="grid grid-cols-2 gap-[18px] mb-6">
          <div className="col-span-2 ios-widget p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75 mb-1">Right now</p>
            <p className="text-[17px] font-semibold leading-snug">{nowData.focus}</p>
            <p className="text-[12px] opacity-75 mt-1.5 line-clamp-2">{nowData.currentlyBuilding[0]}</p>
          </div>
          <button onClick={(e) => onOpen('github', e.currentTarget.getBoundingClientRect())} className="ios-widget p-3.5 aspect-square flex flex-col text-left">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-75"><GitCommitHorizontal className="w-3.5 h-3.5" /> GitHub</p>
            <p className="text-[13px] font-medium mt-2 line-clamp-3 leading-snug">{gh?.latest?.message ?? 'Latest commit'}</p>
            {gh?.latest && <p className="text-[11px] opacity-70 mt-1">{timeAgo(gh.latest.at)}</p>}
            <div className="mt-auto flex items-end gap-[2px] h-7">
              {(gh?.daily ?? Array(30).fill(0)).map((n, i) => (
                <span key={i} className="flex-1 rounded-[1px]" style={{ height: `${n ? 25 + (n / max) * 75 : 12}%`, background: n ? '#30D158' : 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
          </button>
          <a href="https://leetcode.com/u/Ritik812800/" target="_blank" rel="noopener noreferrer" className="ios-widget p-3.5 aspect-square flex flex-col">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-75"><Code2 className="w-3.5 h-3.5" /> LeetCode</p>
            {lc && lc.solved > 0 ? (
              <>
                <p className="text-[40px] font-semibold leading-none mt-auto">{lc.solved}</p>
                <p className="text-[12px] opacity-75 mt-1">solved · E{lc.easy} M{lc.medium} H{lc.hard}</p>
              </>
            ) : (
              <p className="text-[14px] font-medium mt-auto leading-snug">Just started the DSA streak. Follow along.</p>
            )}
          </a>
        </div>

        {/* App grid */}
        <div className="grid grid-cols-4 gap-y-6 justify-items-center">{HOME_GRID.map((id) => icon(id))}</div>
      </div>

      {/* Search pill */}
      <button onClick={onSearch} className="absolute left-1/2 -translate-x-1/2 bottom-[112px] ios-widget !rounded-full px-3 py-1 flex items-center gap-1 text-[12px] text-white">
        <Search className="w-3 h-3" /> Search
      </button>

      {/* Dock */}
      <div className="absolute inset-x-3 ios-dock h-[92px] flex items-center justify-around px-3" style={{ bottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        {HOME_DOCK.map((id) => icon(id, false))}
      </div>
    </motion.div>
  );
}
