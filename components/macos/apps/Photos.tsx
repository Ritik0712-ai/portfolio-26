'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProjects, PORTRAITS } from '@/components/os/data';

export function usePhotoLibrary() {
  const { data: projects } = useProjects();
  return useMemo(() => {
    const shots = (projects ?? []).flatMap((p) =>
      [p.cover_image, ...(p.gallery ?? [])].filter(Boolean).map((src) => ({ src: src as string, album: p.title }))
    );
    return [...PORTRAITS.map((src) => ({ src, album: 'Me' })), ...shots];
  }, [projects]);
}

export default function Photos() {
  const photos = usePhotoLibrary();
  const albums = useMemo(() => ['All Photos', ...Array.from(new Set(photos.map((p) => p.album)))], [photos]);
  const [album, setAlbum] = useState('All Photos');
  const [open, setOpen] = useState<number | null>(null);
  const list = album === 'All Photos' ? photos : photos.filter((p) => p.album === album);

  return (
    <div className="flex h-full mac-text text-[13px] relative">
      <aside className="w-44 shrink-0 mac-sidebar px-2 py-3 overflow-y-auto">
        <p className="px-2 mb-1 text-[11px] font-semibold mac-text-faint">Library</p>
        {albums.map((a) => (
          <button key={a} onClick={() => setAlbum(a)} className={`w-full text-left px-2 py-1 rounded-md ${album === a ? 'mac-sidebar-active' : 'mac-hover'}`}>{a}</button>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto p-1 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-[150px] gap-1 content-start">
        {list.map((p, i) => (
          <button key={p.src + i} onClick={() => setOpen(i)} className="relative overflow-hidden bg-black/10">
            <Image src={p.src} alt={p.album} fill sizes="200px" className="object-cover hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>
      {open !== null && list[open] && (
        <div className="absolute inset-0 z-10 bg-black/90 flex items-center justify-center" onClick={() => setOpen(null)}>
          <div className="relative w-[90%] h-[85%]" onClick={(e) => e.stopPropagation()}>
            <Image src={list[open].src} alt={list[open].album} fill sizes="900px" className="object-contain" />
          </div>
          <button aria-label="Close" onClick={() => setOpen(null)} className="absolute top-3 right-3 p-2 rounded-full bg-white/15 text-white"><X className="w-4 h-4" /></button>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }} className="absolute left-3 p-2 rounded-full bg-white/15 text-white"><ChevronLeft className="w-5 h-5" /></button>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }} className="absolute right-3 p-2 rounded-full bg-white/15 text-white"><ChevronRight className="w-5 h-5" /></button>
          <p className="absolute bottom-3 text-white/80 text-[12px]">{list[open].album} · {open + 1} of {list.length}</p>
        </div>
      )}
    </div>
  );
}
