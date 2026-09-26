'use client';

import { ArrowUpRight, Music2 } from 'lucide-react';
import { useNowPlaying, ago } from '@/lib/useNowPlaying';
import { T } from '@/lib/i18n';

/** Equaliser bars that bounce while a track is playing. */
export function Equaliser({ playing, className = '' }: { playing: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[2px] h-3 ${className}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm bg-current ${playing ? 'animate-eq' : ''}`}
          style={{ height: playing ? undefined : `${[40, 70, 55, 30][i]}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// Homepage card. Renders nothing until a now-playing source is configured
// and has something recent.
export default function NowPlaying({ className = '' }: { className?: string }) {
  const track = useNowPlaying();
  if (!track) return null;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group reveal flex items-center gap-4 bg-surface border border-border rounded-lg p-4 hover:border-rule transition-colors ${className}`}
    >
      {track.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.cover} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
      ) : (
        <span className="w-14 h-14 rounded bg-bg-secondary flex items-center justify-center shrink-0"><Music2 className="w-5 h-5 text-text-muted" /></span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-faint mb-1">
          <Equaliser playing={track.isPlaying} className="text-[#1DB954]" />
          {track.isPlaying ? <T en="Listening now" hi="अभी सुन रहा हूँ" /> : <T en={`Last played · ${ago(track.playedAt)}`} hi={`आख़िरी बार सुना · ${ago(track.playedAt)}`} />}
        </span>
        <span className="block font-display text-lg text-text-primary truncate group-hover:text-accent transition-colors">{track.title}</span>
        <span className="block text-sm text-text-muted truncate">{track.artist}</span>
      </span>
      <ArrowUpRight className="w-4 h-4 text-text-faint group-hover:text-text-primary transition-colors shrink-0" />
    </a>
  );
}
