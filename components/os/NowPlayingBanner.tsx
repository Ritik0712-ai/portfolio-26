'use client';

import { ExternalLink } from 'lucide-react';
import { useNowPlaying, ago } from '@/lib/useNowPlaying';
import { Equaliser } from '@/components/NowPlaying';

// "What Ritik is actually listening to" — shared by every RitikOS Music app
// and widget. Colours come from the edition's --mac-* variables. Renders
// nothing until Last.fm/Spotify is configured.
export default function NowPlayingBanner({ accent = '#FA2D48', className = '' }: { accent?: string; className?: string }) {
  const track = useNowPlaying();
  if (!track) return null;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-xl mac-card p-3 mac-text hover:opacity-90 ${className}`}
    >
      {track.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.cover} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
      ) : (
        <span className="w-12 h-12 rounded-lg shrink-0" style={{ background: accent, opacity: 0.25 }} />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
          <Equaliser playing={track.isPlaying} />
          {track.isPlaying ? 'Ritik is listening now' : `Ritik last played · ${ago(track.playedAt)}`}
        </span>
        <span className="block text-[14px] font-semibold truncate">{track.title}</span>
        <span className="block text-[12px] mac-text-faint truncate">{track.artist}</span>
      </span>
      <ExternalLink className="w-3.5 h-3.5 mac-text-faint shrink-0" />
    </a>
  );
}
