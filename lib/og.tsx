import { ImageResponse } from 'next/og';

// Shared renderer for generated Open Graph images (1200x630). Uses the site's
// dark palette and fetches Cormorant Garamond / DM Sans subsets from Google
// Fonts at render time; if that fails it falls back to the default font
// rather than breaking the share card.

export const OG_SIZE = { width: 1200, height: 630 };

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

interface OgInput {
  eyebrow: string;
  title: string;
  description?: string | null;
  tags?: string[];
}

export async function renderOg({ eyebrow, title, description, tags = [] }: OgInput) {
  const desc = description
    ? description.length > 150
      ? `${description.slice(0, 150).replace(/\s+\S*$/, '')}…`
      : description
    : '';
  const tagLine = tags.slice(0, 5).join('  ·  ');
  const serifText = `${title}RA`;
  const sansText = `${eyebrow}${eyebrow.toUpperCase()}${desc}${tagLine}Ritik Agarwalritikagarwal.me·—`;

  const [serif, sans] = await Promise.all([
    loadFont('Cormorant Garamond', 600, serifText),
    loadFont('DM Sans', 400, sansText),
  ]);

  const fonts = [
    serif && { name: 'Cormorant', data: serif, weight: 600 as const, style: 'normal' as const },
    sans && { name: 'DMSans', data: sans, weight: 400 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' }[];

  const titleSize = title.length > 60 ? 64 : title.length > 36 ? 76 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#1A1714',
          color: '#F0EBE3',
          fontFamily: 'DMSans',
          borderBottom: '8px solid #8A9A6A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: '#8C857C' }}>
            {eyebrow}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Cormorant', fontSize: 40, color: '#F0EBE3' }}>RA</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Cormorant', fontSize: titleSize, lineHeight: 1.05, maxWidth: 1000 }}>
            {title}
          </div>
          {desc && (
            <div style={{ display: 'flex', marginTop: 28, fontSize: 28, lineHeight: 1.4, color: '#C4BDB4', maxWidth: 980 }}>
              {desc}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 22, color: '#8C857C' }}>
          <div style={{ display: 'flex' }}>Ritik Agarwal — ritikagarwal.me</div>
          {tagLine && <div style={{ display: 'flex', color: '#8A9A6A' }}>{tagLine}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}
