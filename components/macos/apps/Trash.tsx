'use client';

import { Trash2 } from 'lucide-react';

export default function Trash() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center mac-text px-6">
      <Trash2 className="w-12 h-12 mac-text-faint mb-3" strokeWidth={1.3} />
      <p className="text-[15px] font-semibold">Trash is empty</p>
      <p className="text-[12px] mac-text-faint mt-1 max-w-xs">
        Every abandoned side project got shipped, archived on GitHub, or turned into a lesson in a case study.
      </p>
    </div>
  );
}
