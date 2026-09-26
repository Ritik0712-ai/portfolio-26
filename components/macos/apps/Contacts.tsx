'use client';

import Image from 'next/image';
import { Mail, Github, Linkedin, Code2, Globe, MessageSquare } from 'lucide-react';
import { PROFILE } from '@/components/os/data';
import StatsRow from '@/components/os/StatsRow';

export default function Contacts({ onMessage }: { onMessage: () => void }) {
  const rows = [
    { label: 'email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, icon: Mail },
    { label: 'GitHub', value: 'Ritik0712-ai', href: PROFILE.github, icon: Github },
    { label: 'LinkedIn', value: 'ritik-agarwal', href: PROFILE.linkedin, icon: Linkedin },
    { label: 'LeetCode', value: 'Ritik812800', href: PROFILE.leetcode, icon: Code2 },
    { label: 'homepage', value: 'ritikagarwal.me', href: PROFILE.site, icon: Globe },
  ];
  return (
    <div className="h-full overflow-y-auto mac-text text-[13px]">
      <div className="flex flex-col items-center pt-8 pb-5 border-b mac-divider">
        <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg mb-3">
          <Image src={PROFILE.photo} alt={PROFILE.name} fill sizes="96px" className="object-cover object-top" />
        </div>
        <p className="text-[22px] font-semibold">{PROFILE.name}</p>
        <p className="mac-text-faint">{PROFILE.role} · {PROFILE.school}</p>
        <StatsRow className="justify-center text-center mt-4" />
        <div className="flex gap-3 mt-4">
          <button onClick={onMessage} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl mac-card text-[#0A84FF]">
            <MessageSquare className="w-5 h-5" /><span className="text-[11px]">message</span>
          </button>
          <a href={`mailto:${PROFILE.email}`} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl mac-card text-[#0A84FF]">
            <Mail className="w-5 h-5" /><span className="text-[11px]">mail</span>
          </a>
        </div>
      </div>
      <dl className="px-6 py-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[90px_1fr] gap-3 py-2 border-b mac-divider last:border-0">
            <dt className="text-right mac-text-faint">{r.label}</dt>
            <dd><a href={r.href} target={r.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="text-[#0A84FF]">{r.value}</a></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
