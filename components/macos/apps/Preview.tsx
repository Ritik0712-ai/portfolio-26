'use client';

import { Download } from 'lucide-react';
import { resumeUpdated } from '@/data/resume';

export default function Preview() {
  return (
    <div className="flex flex-col h-full mac-text">
      <div className="flex items-center justify-between h-9 px-4 border-b mac-divider text-[12px] shrink-0">
        <span className="mac-text-faint">
          Last updated {new Date(resumeUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <a href="/resume.pdf" download="Ritik_Agarwal_Resume.pdf" className="mac-btn inline-flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      </div>
      <iframe src="/resume.pdf#view=FitH" title="Résumé" className="flex-1 w-full bg-[#525659]" />
    </div>
  );
}
