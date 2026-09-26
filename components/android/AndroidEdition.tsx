'use client';

import dynamic from 'next/dynamic';

const AndroidDevice = dynamic(() => import('./AndroidDevice'), { ssr: false, loading: () => <div className="fixed inset-0 bg-black" /> });

export default function AndroidEdition() {
  return <AndroidDevice />;
}
