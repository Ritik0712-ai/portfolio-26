'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const WinDesktop = dynamic(() => import('./WinDesktop'), { ssr: false });

// The Fluent edition is a desktop OS; on a phone we suggest the Android
// edition instead of squeezing a taskbar onto a 390px screen.
export default function WindowsEdition() {
  const [device, setDevice] = useState<'desktop' | 'phone' | null>(null);
  const [force, setForce] = useState(false);
  useEffect(() => {
    const pick = () => setDevice(window.innerWidth < 900 ? 'phone' : 'desktop');
    pick();
    window.addEventListener('resize', pick);
    return () => window.removeEventListener('resize', pick);
  }, []);
  if (!device) return <div className="fixed inset-0 bg-black" />;
  if (device === 'phone' && !force) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center text-white" style={{ background: 'radial-gradient(60% 50% at 50% 55%, #1b5fd0 0%, #06102a 70%)', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
        <div className="w-20 h-20 rounded-[20px] flex items-center justify-center text-[36px] font-semibold" style={{ background: 'linear-gradient(135deg,#3DB0F7,#0F62D6)', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>RA</div>
        <h1 className="text-[22px] font-semibold">The Fluent edition needs a bigger screen</h1>
        <p className="text-[14px] text-white/75 max-w-sm">It&apos;s a full desktop with windows and a taskbar. On a phone, the Android edition feels right at home.</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link href="/magic/android" className="h-11 rounded-md bg-white text-black font-semibold flex items-center justify-center">Open the Android edition</Link>
          <Link href="/magic/mac" className="h-11 rounded-md border border-white/30 flex items-center justify-center">iPhone-style edition</Link>
          <button onClick={() => setForce(true)} className="h-10 text-[13px] text-white/70">Show the desktop anyway</button>
        </div>
      </div>
    );
  }
  return <WinDesktop />;
}
