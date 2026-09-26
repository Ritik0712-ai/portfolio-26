// Powers /uses. Edit freely — each item is { name, note? }.
export const usesLastUpdated = 'September 2026';

export const uses: { title: string; items: { name: string; note?: string }[] }[] = [
  {
    title: 'Hardware',
    items: [
      { name: 'MacBook Air (Apple Silicon)', note: 'Daily driver for everything.' },
      { name: 'External SSD', note: 'Every project lives on it, so my work moves with me.' },
      { name: 'Realme GT 2', note: 'Current phone.' },
    ],
  },
  {
    title: 'AI & editors',
    items: [
      { name: 'Claude Code', note: 'Phased implementation from a written plan, one reviewable PR at a time.' },
      { name: 'Claude', note: 'Planning docs before any code: PRD, TRD, app flow, UI brief, schema, implementation plan.' },
      { name: 'Cursor', note: 'The other half of implementation, working from the same planning docs.' },
      { name: 'Gemini', note: 'Large-context planning and research.' },
    ],
  },
  {
    title: 'Default stack',
    items: [
      { name: 'Next.js + TypeScript + Tailwind CSS', note: 'Where most projects start.' },
      { name: 'PostgreSQL', note: 'Supabase when I want auth and storage bundled; Neon + Drizzle when I want control.' },
      { name: 'Node.js + Express', note: 'For standalone APIs.' },
      { name: 'Groq / Gemini APIs', note: 'Free-tier LLMs behind a provider chain, so an outage is a config change.' },
    ],
  },
  {
    title: 'Hosting & services',
    items: [
      { name: 'Vercel', note: 'Frontends and Next.js apps, deployed from git.' },
      { name: 'Render', note: 'Long-running Node APIs.' },
      { name: 'Cloudflare R2', note: 'Object storage with zero egress fees.' },
      { name: 'Resend', note: 'Transactional email and this site’s newsletter.' },
    ],
  },
  {
    title: 'This site',
    items: [
      { name: 'Next.js 15 + React 19', note: 'App Router, server components where it matters.' },
      { name: 'Supabase', note: 'Postgres with row-level security, auth for the admin CMS, and media storage.' },
      { name: 'Gemini', note: 'Powers the “Ask about me” assistant, grounded only in this site’s content.' },
      { name: 'Cormorant Garamond + DM Sans', note: 'Typography.' },
    ],
  },
];
