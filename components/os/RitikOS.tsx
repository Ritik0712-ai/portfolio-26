'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Picks the right device for the visitor: iPhone-style on phones, MacBook-style
// on laptops and desktops. Each is code-split so a phone never downloads the
// desktop window manager and vice versa.
const MacDesktop = dynamic(() => import('@/components/macos/MacDesktop'), { ssr: false });
const IOSDevice = dynamic(() => import('@/components/ios/IOSDevice'), { ssr: false });

export default function RitikOS() {
  const [device, setDevice] = useState<'mac' | 'ios' | null>(null);
  useEffect(() => {
    const pick = () => {
      const phone = window.innerWidth < 768 || (window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 600);
      setDevice(phone ? 'ios' : 'mac');
    };
    pick();
    window.addEventListener('resize', pick);
    return () => window.removeEventListener('resize', pick);
  }, []);
  if (!device) return <div className="fixed inset-0 bg-black" />;
  return device === 'ios' ? <IOSDevice /> : <MacDesktop />;
}
