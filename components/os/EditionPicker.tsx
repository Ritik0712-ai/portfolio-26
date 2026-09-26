'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Laptop, Smartphone } from 'lucide-react';
import { readPref, writePref } from '@/components/macos/settings';

type Edition = 'mac' | 'windows' | 'android';

const EDITIONS: { id: Edition; href: string; name: string; tagline: string; bestOn: string; phoneOk: boolean }[] = [
  { id: 'mac', href: '/magic/mac', name: 'Mac', tagline: 'Menu bar, Dock, Finder and Spotlight. Turns into an iPhone on phones.', bestOn: 'Laptop & phone', phoneOk: true },
  { id: 'windows', href: '/magic/windows', name: 'Windows', tagline: 'Start menu, taskbar, widgets and snap layouts, Fluent style.', bestOn: 'Laptop', phoneOk: false },
  { id: 'android', href: '/magic/android', name: 'Android', tagline: 'Material You phone with widgets, app drawer and quick settings.', bestOn: 'Phone & laptop', phoneOk: true },
];

// The /magic landing: pick which OS skin to explore the portfolio in. No
// edition is the default — the last one used is only highlighted.
export default function EditionPicker() {
  const router = useRouter();
  const [last, setLast] = useState<Edition | null>(null);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const l = readPref('ritikos-edition', '');
    if (l === 'mac' || l === 'windows' || l === 'android') setLast(l);
    const check = () => setPhone(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    EDITIONS.forEach((e) => router.prefetch(e.href));
    const onKey = (e: KeyboardEvent) => {
      const i = ['1', '2', '3'].indexOf(e.key);
      if (i >= 0) { writePref('ritikos-edition', EDITIONS[i].id); router.push(EDITIONS[i].href); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('keydown', onKey); };
  }, [router]);

  return (
    <main
      className="min-h-[100dvh] text-white px-5 sm:px-8 py-8 sm:py-12 flex flex-col"
      style={{ background: 'radial-gradient(70% 55% at 50% 0%, #2b2640 0%, #121016 60%, #0b0a0d 100%)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
    >
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white w-fit">
          <ArrowLeft className="w-4 h-4" /> Classic portfolio
        </Link>

        <header className="mt-8 sm:mt-12 mb-8 sm:mb-12 max-w-2xl">
          <p className="text-[12px] uppercase tracking-[0.22em] text-white/45 mb-3">RitikOS · Magic</p>
          <h1 className="text-[40px] sm:text-[56px] leading-[1.02] font-semibold tracking-tight" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Pick your operating system.
          </h1>
          <p className="mt-4 text-[15px] sm:text-[17px] text-white/65 leading-relaxed">
            Same portfolio, same live projects, blog and GitHub — just three different ways to explore it. You can switch any time from inside each one.
          </p>
        </header>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {EDITIONS.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.2, 0, 0, 1] }}
            >
              <Link
                href={e.href}
                onClick={() => writePref('ritikos-edition', e.id)}
                className="group block rounded-[22px] bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/[0.07] transition-colors overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                    <Preview id={e.id} />
                  </div>
                  {last === e.id && (
                    <span className="absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/55 backdrop-blur">Last used</span>
                  )}
                  <span className="absolute top-3 right-3 text-[11px] font-mono w-6 h-6 rounded-md bg-black/45 backdrop-blur hidden md:flex items-center justify-center text-white/80">{i + 1}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[22px] font-semibold">{e.name}</h2>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[14px] text-white/60 mt-1.5 leading-relaxed">{e.tagline}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-white/55">
                    {e.id === 'windows' ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                    Best on {e.bestOn.toLowerCase()}
                    {phone && !e.phoneOk && <span className="text-[#ffb86b]"> · needs a bigger screen</span>}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-auto pt-10 text-[12px] text-white/35">
          Inspired by macOS, Windows and Android design languages. Not affiliated with Apple, Microsoft or Google. {!phone && 'Tip: press 1, 2 or 3.'}
        </p>
      </div>
    </main>
  );
}

/** Tiny CSS-drawn previews, built from each edition's own wallpaper. */
function Preview({ id }: { id: Edition }) {
  if (id === 'mac') {
    return (
      <div className="absolute inset-0 mac-wallpaper-dusk">
        <div className="absolute top-0 inset-x-0 h-[7%] bg-black/25 backdrop-blur-sm flex items-center px-[3%] gap-[3%]">
          <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>RA</span>
          {[14, 10, 12].map((w, i) => <span key={i} className="h-[3px] rounded-full bg-white/60" style={{ width: `${w}%` }} />)}
        </div>
        <div className="absolute left-[16%] top-[18%] w-[56%] h-[52%] rounded-[6px] bg-[#1e1e20]/90 shadow-2xl border border-white/10">
          <div className="h-[16%] flex items-center gap-[3%] px-[4%]">
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} className="w-[5%] aspect-square rounded-full" style={{ background: c }} />)}
          </div>
          <div className="px-[6%] space-y-[5%] pt-[3%]">
            <span className="block h-[5px] w-[60%] rounded bg-white/50" />
            <span className="block h-[4px] w-[85%] rounded bg-white/20" />
            <span className="block h-[4px] w-[70%] rounded bg-white/20" />
          </div>
        </div>
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 h-[12%] px-[1.5%] rounded-[8px] bg-white/25 backdrop-blur-md border border-white/20 flex items-center gap-[6px]">
          {['#3A8DFF', '#34C759', '#FF9F0A', '#FF375F', '#8E8E93', '#5E5CE6'].map((c) => (
            <span key={c} className="h-[70%] aspect-square rounded-[5px]" style={{ background: c }} />
          ))}
        </div>
      </div>
    );
  }
  if (id === 'windows') {
    return (
      <div className="absolute inset-0 win-root win-wallpaper-glow" data-win-theme="dark">
        <div className="absolute left-[20%] top-[14%] w-[60%] h-[58%] rounded-[5px] bg-[#202020]/95 shadow-2xl border border-white/10">
          <div className="h-[13%] flex items-center justify-end gap-[6%] pr-[4%] text-white/70">
            <span className="w-[5%] h-px bg-current" />
            <span className="w-[4%] aspect-square border border-current rounded-[1px]" />
            <span className="text-[8px] leading-none">✕</span>
          </div>
          <div className="flex h-[80%]">
            <div className="w-[28%] border-r border-white/10 p-[4%] space-y-[10%]">
              {[70, 55, 80, 60].map((w, i) => <span key={i} className="block h-[3px] rounded bg-white/30" style={{ width: `${w}%` }} />)}
            </div>
            <div className="flex-1 p-[5%] grid grid-cols-3 gap-[8%] content-start">
              {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="aspect-[4/3] rounded-[2px] bg-[#F7B928]/90" />)}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-[10%] bg-[#1c1c1c]/85 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-[2%]">
          <span className="h-[62%] aspect-square rounded-[3px]" style={{ background: 'linear-gradient(135deg,#3DB0F7,#0F62D6)' }} />
          {['#F7B928', '#3A96DD', '#4CC2FF', '#2B2B2B', '#C4166B', '#8a8a8a'].map((c) => (
            <span key={c} className="h-[55%] aspect-square rounded-[3px]" style={{ background: c }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(70% 70% at 50% 40%, #3b2a22 0%, #16110e 80%)' }}>
      <div className="relative h-[88%] aspect-[9/19] rounded-[14px] bg-[#1b1b1d] p-[3%] shadow-2xl">
        <div className="relative w-full h-full rounded-[11px] overflow-hidden and-wallpaper-dune">
          <span className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[6%] aspect-square rounded-full bg-black" />
          <p className="absolute top-[10%] left-[10%] text-white leading-[0.85] text-[22px] font-light tabular-nums drop-shadow">
            <span className="block text-[#FFDBCC]">12</span>
            <span className="block text-[#FFDBCC]">45</span>
          </p>
          <div className="absolute left-[8%] right-[8%] top-[44%] grid grid-cols-2 gap-[6%]">
            <span className="h-6 rounded-[8px] bg-[#FFDBCC]" />
            <span className="h-6 rounded-[8px] bg-[#F7DED3]/90" />
          </div>
          <div className="absolute left-[8%] right-[8%] bottom-[16%] grid grid-cols-4 gap-y-[20%] gap-x-[8%]">
            {Array.from({ length: 8 }).map((_, i) => <span key={i} className="aspect-square rounded-full bg-[#FFDBCC]" />)}
          </div>
          <span className="absolute bottom-[6%] left-[8%] right-[8%] h-[5%] rounded-full bg-[#F2E5E0]" />
        </div>
      </div>
    </div>
  );
}
