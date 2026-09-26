import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { uses, usesLastUpdated } from '@/data/uses';

export const metadata: Metadata = pageMetadata({ title: 'Uses', path: '/uses' });

export default function UsesPage() {
  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-14">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">/uses</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-4">
            What I use
          </h1>
          <p className="text-text-secondary font-body leading-relaxed max-w-xl">
            The hardware, tools and services behind my projects and this site. Updated {usesLastUpdated}.
          </p>
        </header>

        <div className="space-y-12">
          {uses.map((group) => (
            <section key={group.title} className="reveal">
              <h2 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4">{group.title}</h2>
              <ul className="divide-y divide-border border-y border-border">
                {group.items.map((item) => (
                  <li key={item.name} className="grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-6 py-4">
                    <span className="text-sm font-medium text-text-primary font-body">{item.name}</span>
                    {item.note && <span className="text-sm text-text-muted font-body">{item.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
