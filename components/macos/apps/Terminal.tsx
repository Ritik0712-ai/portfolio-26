'use client';

import { useEffect, useRef, useState } from 'react';
import { useProjects, useCertifications, useTimeline, askAssistant, formatMonth, PROFILE } from '@/components/os/data';
import { skillGroups } from '@/data/skills';
import { nowData } from '@/data/now';
import { aboutParagraphs } from '@/data/about';

interface Line { kind: 'in' | 'out' | 'err' | 'accent'; text: string }

const PROMPT = 'ritik@RitikOS ~ %';
const COMMANDS = ['help', 'whoami', 'about', 'ls', 'open', 'projects', 'experience', 'certs', 'skills', 'now', 'resume', 'contact', 'socials', 'ask', 'neofetch', 'date', 'echo', 'history', 'clear', 'exit', 'sudo'];

const HELP = `Available commands:
  whoami            who is this?
  about             a short bio
  ls [folder]       list projects | experience | certs
  open <project>    open a project's case study
  skills            what I work with
  now               what I'm doing right now
  resume            open my résumé
  contact           how to reach me
  socials           GitHub, LinkedIn, LeetCode
  ask <question>    ask the AI assistant about me
  neofetch          system info
  history · clear · date · echo · exit`;

export default function Terminal({ onClose, onOpenResume, onOpenProject, onOpenMail }: {
  onClose: () => void;
  onOpenResume: () => void;
  onOpenProject: (slug: string) => void;
  onOpenMail: () => void;
}) {
  const { data: projects } = useProjects();
  const { data: certs } = useCertifications();
  const { data: timeline } = useTimeline();
  const [lines, setLines] = useState<Line[]>([
    { kind: 'accent', text: `Last login: ${new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} on ttys000` },
    { kind: 'out', text: "Welcome to RitikOS. Type 'help' to see what you can do." },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: 'end' }), [lines, busy]);

  const print = (...ls: Line[]) => setLines((prev) => [...prev, ...ls]);
  const out = (text: string) => print({ kind: 'out', text });

  const run = async (raw: string) => {
    const cmdline = raw.trim();
    print({ kind: 'in', text: `${PROMPT} ${cmdline}` });
    if (!cmdline) return;
    setHistory((h) => [...h, cmdline]);
    setHIndex(-1);
    const [cmd, ...rest] = cmdline.split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help': return out(HELP);
      case 'whoami': return out(`${PROFILE.name} — ${PROFILE.role}, ${PROFILE.school}`);
      case 'about': return out(aboutParagraphs.join('\n\n'));
      case 'ls': {
        const what = (arg || 'projects').toLowerCase();
        if (what.startsWith('proj')) return out((projects ?? []).map((p) => `${p.slug.padEnd(16)} ${p.short_description ?? ''}`).join('\n') || 'Loading…');
        if (what.startsWith('exp')) return out((timeline ?? []).map((t) => `${formatMonth(t.event_date).padEnd(10)} ${t.title}`).join('\n') || 'Loading…');
        if (what.startsWith('cert')) return out((certs ?? []).map((c) => `${c.title} — ${c.issuer}`).join('\n') || 'No certifications yet.');
        return print({ kind: 'err', text: `ls: ${arg}: No such file or directory` });
      }
      case 'projects': return run('ls projects');
      case 'experience': return run('ls experience');
      case 'certs': return run('ls certs');
      case 'open': {
        const p = projects?.find((x) => x.slug === arg.toLowerCase() || x.title.toLowerCase() === arg.toLowerCase());
        if (!p) return print({ kind: 'err', text: `open: ${arg || '(nothing)'}: project not found. Try 'ls projects'.` });
        out(`Opening ${p.title} in Safari…`);
        return onOpenProject(p.slug);
      }
      case 'skills': return out(skillGroups.map((g) => `${g.title.padEnd(16)} ${g.skills.join(', ')}`).join('\n'));
      case 'now': return out(`${nowData.focus}\n\nBuilding:\n${nowData.currentlyBuilding.map((b) => `  • ${b}`).join('\n')}\nLearning:\n${nowData.currentlyLearning.map((b) => `  • ${b}`).join('\n')}`);
      case 'resume': case 'cv': out('Opening résumé in Preview…'); return onOpenResume();
      case 'contact': out(`Email: ${PROFILE.email}\nOpening Mail…`); return onOpenMail();
      case 'socials': return out(`GitHub    ${PROFILE.github}\nLinkedIn  ${PROFILE.linkedin}\nLeetCode  ${PROFILE.leetcode}`);
      case 'ask': {
        if (!arg) return print({ kind: 'err', text: 'usage: ask <question>' });
        setBusy(true);
        try {
          const answer = await askAssistant([{ role: 'user', content: arg }]);
          out(answer.replace(/\*\*(.+?)\*\*/g, '$1'));
        } catch (e) {
          print({ kind: 'err', text: e instanceof Error ? e.message : 'ask: failed' });
        } finally {
          setBusy(false);
        }
        return;
      }
      case 'neofetch':
        return print(
          { kind: 'accent', text: '   ██████╗  █████╗     ritik@RitikOS' },
          { kind: 'accent', text: '   ██╔══██╗██╔══██╗    ─────────────' },
          { kind: 'out', text: `   ██████╔╝███████║    OS: RitikOS 1.0 (Magic)\n   ██╔══██╗██╔══██║    Host: ${PROFILE.school}\n   ██║  ██║██║  ██║    Kernel: Next.js 15 · React 19\n   ╚═╝  ╚═╝╚═╝  ╚═╝    Shell: rtksh\n                       Projects: ${projects?.length ?? '…'}\n                       Stack: TypeScript, Node, Postgres` }
        );
      case 'date': return out(new Date().toString());
      case 'echo': return out(arg);
      case 'history': return out(history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n'));
      case 'clear': return setLines([]);
      case 'exit': return onClose();
      case 'sudo': return print({ kind: 'err', text: 'Nice try. This incident will be reported to Ritik.' });
      default: return print({ kind: 'err', text: `rtksh: command not found: ${cmd}. Type 'help'.` });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = input;
      setInput('');
      run(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const i = hIndex < 0 ? history.length - 1 : Math.max(0, hIndex - 1);
      setHIndex(i);
      setInput(history[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIndex < 0) return;
      const i = hIndex + 1;
      if (i >= history.length) { setHIndex(-1); setInput(''); } else { setHIndex(i); setInput(history[i]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMANDS.filter((c) => c.startsWith(input.trim()));
      if (match.length === 1) setInput(match[0] + ' ');
      else if (match.length > 1) print({ kind: 'in', text: `${PROMPT} ${input}` }, { kind: 'out', text: match.join('  ') });
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#1E1E1E] text-[#E5E5E5] font-mono text-[12.5px] leading-[1.55] p-3 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((l, i) => (
        <pre key={i} className={`whitespace-pre-wrap break-words ${l.kind === 'err' ? 'text-[#FF6B6B]' : l.kind === 'accent' ? 'text-[#7EE787]' : l.kind === 'in' ? 'text-white' : ''}`}>
          {l.text}
        </pre>
      ))}
      {busy ? (
        <p className="text-[#8B949E]">thinking…</p>
      ) : (
        <div className="flex gap-2">
          <span className="text-[#7EE787] shrink-0">{PROMPT}</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            aria-label="Terminal input"
            className="flex-1 bg-transparent outline-none text-white caret-[#7EE787]"
          />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
