'use client';

import { useState } from 'react';
import { aboutHeadline, aboutParagraphs } from '@/data/about';
import { nowData } from '@/data/now';
import { uses } from '@/data/uses';

interface Note {
  id: string;
  title: string;
  date: string;
  preview: string;
  body: React.ReactNode;
}

const NOTES: Note[] = [
  {
    id: 'about',
    title: aboutHeadline,
    date: 'Pinned',
    preview: aboutParagraphs[0],
    body: (
      <>
        <h1 className="text-2xl font-bold mb-4">{aboutHeadline}</h1>
        {aboutParagraphs.map((p) => (
          <p key={p.slice(0, 20)} className="mb-3 leading-relaxed">{p}</p>
        ))}
      </>
    ),
  },
  {
    id: 'now',
    title: 'What I’m doing now',
    date: nowData.lastUpdated,
    preview: nowData.focus,
    body: (
      <>
        <h1 className="text-2xl font-bold mb-2">What I’m doing now</h1>
        <p className="mac-text-faint text-[12px] mb-4">Updated {nowData.lastUpdated}</p>
        <p className="font-semibold mb-4">{nowData.focus}</p>
        {([
          ['Building', nowData.currentlyBuilding],
          ['Learning', nowData.currentlyLearning],
          ['Reading', nowData.currentlyReading],
        ] as const).map(([h, items]) => (
          <div key={h} className="mb-4">
            <h2 className="font-semibold mb-1.5">{h}</h2>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </>
    ),
  },
  {
    id: 'uses',
    title: 'What I use',
    date: 'Setup',
    preview: uses.map((g) => g.title).join(', '),
    body: (
      <>
        <h1 className="text-2xl font-bold mb-4">What I use</h1>
        {uses.map((g) => (
          <div key={g.title} className="mb-4">
            <h2 className="font-semibold mb-1.5">{g.title}</h2>
            <ul className="list-disc pl-5 space-y-1">
              {g.items.map((i) => (
                <li key={i.name}>
                  <span className="font-medium">{i.name}</span>
                  {i.note ? <span className="mac-text-muted"> — {i.note}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    ),
  },
];

export default function Notes({ initialNote = 'about' }: { initialNote?: string }) {
  const [active, setActive] = useState(initialNote);
  const note = NOTES.find((n) => n.id === active) ?? NOTES[0];
  return (
    <div className="flex h-full text-[13px] mac-text">
      <aside className="w-60 shrink-0 mac-sidebar overflow-y-auto py-2">
        {NOTES.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`w-full text-left px-4 py-2.5 border-b mac-divider ${active === n.id ? 'bg-[#F5C518]/35' : 'mac-hover'}`}
          >
            <p className="font-semibold truncate">{n.title}</p>
            <p className="text-[12px] mac-text-faint truncate">
              <span className="mac-text-muted">{n.date}</span> {n.preview}
            </p>
          </button>
        ))}
      </aside>
      <article className="flex-1 overflow-y-auto px-8 py-6 mac-notes-paper">{note.body}</article>
    </div>
  );
}
