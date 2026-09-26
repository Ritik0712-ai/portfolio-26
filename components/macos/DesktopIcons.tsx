'use client';

import { useState } from 'react';
import { FolderIcon, DocIcon } from './icons';

export interface DesktopItem {
  id: string;
  label: string;
  kind: 'folder' | 'pdf';
  open: () => void;
}

export default function DesktopIcons({ items }: { items: DesktopItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="absolute top-10 right-4 flex flex-col items-center gap-3 z-[5]" onClick={(e) => e.stopPropagation()}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setSelected(it.id)}
          onDoubleClick={it.open}
          onKeyDown={(e) => e.key === 'Enter' && it.open()}
          onBlur={() => setSelected((s) => (s === it.id ? null : s))}
          className="w-[92px] flex flex-col items-center gap-1 focus:outline-none"
        >
          <div className={`p-1.5 rounded-md ${selected === it.id ? 'bg-black/30' : ''}`}>
            {it.kind === 'folder' ? <FolderIcon size={60} /> : <DocIcon size={56} />}
          </div>
          <span className={`text-[12px] leading-tight px-1.5 py-px rounded ${selected === it.id ? 'bg-[#2E6BD9] text-white' : 'mac-on-wallpaper mac-label-shadow'}`}>
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}
