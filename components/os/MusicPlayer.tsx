'use client';

import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { musicPicks, spotifyEmbed, spotifyLink, type MusicItem } from '@/data/music';

// Music app shared by macOS and iOS. Playback is Spotify's official embed
// player: visitors signed in to Spotify hear full tracks, everyone else gets
// 30-second previews. Browsers block autoplay, so the listener presses play.
export default function MusicPlayer({ layout }: { layout: 'mac' | 'ios' }) {
  const [current, setCurrent] = useState<MusicItem>(musicPicks[0]);
  const ios = layout === 'ios';

  const list = (
    <ul className={ios ? 'ios-list' : ''}>
      {musicPicks.map((t, i) => {
        const active = t.id === current.id;
        return (
          <li key={t.id}>
            <button
              onClick={() => setCurrent(t)}
              className={
                ios
                  ? 'ios-row'
                  : `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${active ? 'bg-[#FA2D48]/15' : 'mac-hover'}`
              }
              style={ios ? { ['--ios-inset' as string]: '72px' } : undefined}
              aria-current={active}
            >
              <span className={`w-5 text-[12px] text-right tabular-nums ${active ? 'text-[#FA2D48]' : 'mac-text-faint'}`}>
                {active ? <Play className="w-3 h-3 inline fill-current" /> : i + 1}
              </span>
              <img src={t.cover} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${active ? 'text-[#FA2D48] font-semibold' : ''}`}>{t.title}</span>
                <span className="block text-[12px] mac-text-faint truncate">{t.artist}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const player = (
    <iframe
      key={current.id}
      title={`${current.title} on Spotify`}
      src={spotifyEmbed(current)}
      className="w-full rounded-xl border-0"
      height={152}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );

  if (ios) {
    return (
      <div className="pb-4">
        <div className="flex flex-col items-center text-center pt-2 pb-5">
          <img src={current.cover.replace('00001e02', '0000b273')} alt="" className="w-56 h-56 rounded-2xl shadow-2xl object-cover mb-4" />
          <p className="text-[22px] font-bold leading-tight">{current.title}</p>
          <p className="text-[17px] text-[#FA2D48]">{current.artist}</p>
        </div>
        {player}
        <a href={spotifyLink(current)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[15px] ios-blue mt-3">
          Open in Spotify <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <p className="ios-section-header mt-6">Ritik&apos;s picks</p>
        {list}
      </div>
    );
  }

  return (
    <div className="flex h-full mac-text text-[13px]">
      <aside className="w-72 shrink-0 mac-sidebar overflow-y-auto p-2">
        <p className="px-3 pt-1 pb-2 text-[11px] font-semibold mac-text-faint uppercase tracking-wide">Ritik&apos;s picks</p>
        {list}
      </aside>
      <div className="flex-1 min-w-0 overflow-y-auto p-6 flex flex-col items-center">
        <img src={current.cover.replace('00001e02', '0000b273')} alt="" className="w-56 h-56 rounded-xl shadow-2xl object-cover mb-4" />
        <p className="text-[20px] font-bold text-center leading-tight">{current.title}</p>
        <p className="text-[#FA2D48] mb-1 text-center">{current.artist}</p>
        {current.album && <p className="mac-text-faint text-[12px] mb-5">{current.album}</p>}
        <div className="w-full max-w-md">{player}</div>
        <a href={spotifyLink(current)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-[#0A84FF]">
          Open in Spotify <ExternalLink className="w-3 h-3" />
        </a>
        <p className="mt-6 text-[11px] mac-text-faint text-center max-w-sm">
          Plays through Spotify. Sign in to Spotify in this browser for full tracks; otherwise you’ll hear previews.
        </p>
      </div>
    </div>
  );
}
