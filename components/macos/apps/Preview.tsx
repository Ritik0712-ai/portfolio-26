'use client';

import { Download } from 'lucide-react';
import { resumeHighlights as r, resumeUpdated } from '@/data/resume';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#2563eb] pb-1.5 mb-3 border-b border-[#2563eb]/40">
        {title}
      </h2>
      {children}
    </section>
  );
}

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

      <div className="flex-1 overflow-y-auto bg-[#525659] p-4 sm:p-6">
        <article className="mx-auto max-w-[640px] bg-white text-[#1f2937] rounded-sm shadow-xl px-6 sm:px-10 py-8 text-[13px] leading-relaxed">
          <header className="text-center">
            <h1 className="text-[26px] font-bold tracking-wide text-[#111827]">{r.name.toUpperCase()}</h1>
            <p className="italic text-[#6b7280]">{r.title}</p>
            <p className="mt-1 text-[12px]">
              <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a>
              <span className="mx-2 text-[#9ca3af]">|</span>
              <a href={r.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">LinkedIn</a>
              <span className="mx-2 text-[#9ca3af]">|</span>
              <a href={r.github} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">GitHub</a>
            </p>
          </header>

          <p className="mt-5 italic text-[#4b5563]">{r.summary}</p>

          <Section title="Education">
            <p><span className="font-semibold text-[#111827]">{r.education.school}</span> · {r.education.degree}</p>
            <p className="italic text-[#6b7280]">{r.education.detail}</p>
          </Section>

          <Section title="Skills">
            <ul className="space-y-1">
              {r.skills.map((s) => (
                <li key={s.label}><span className="font-semibold text-[#111827]">{s.label}:</span> {s.items}</li>
              ))}
            </ul>
          </Section>

          <Section title="Projects">
            <div className="space-y-4">
              {r.projects.map((p) => (
                <div key={p.name}>
                  <p>
                    <span className="font-semibold text-[#111827]">{p.name}</span>
                    <span className="mx-1.5 text-[#9ca3af]">|</span>
                    <span className="italic">{p.tagline}</span>
                  </p>
                  <p className="text-[12px] text-[#6b7280]">{p.stack}</p>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <div className="mt-8 pt-5 border-t border-[#e5e7eb] text-center">
            <p className="text-[12px] text-[#6b7280] mb-3">This is a summary. Download the PDF for the full résumé.</p>
            <a
              href="/resume.pdf"
              download="Ritik_Agarwal_Resume.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#2563eb] text-white text-[13px] font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              <Download className="w-4 h-4" /> Download full résumé (PDF)
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
