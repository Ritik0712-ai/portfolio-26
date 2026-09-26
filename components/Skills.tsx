import { skillGroups } from '@/data/skills';
import { T } from '@/lib/i18n';


const GROUP_HI: Record<string, string> = {
  Languages: 'भाषाएँ',
  Frontend: 'फ़्रंटएंड',
  'Backend & Data': 'बैकएंड और डेटा',
  'AI & Cloud': 'AI और क्लाउड',
};

export default function Skills() {
  return (
    <section id="skills" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2"><T en="Toolkit" hi="टूलकिट" /></p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary"><T en="Skills" hi="स्किल्स" /></h2>
        </div>

        <dl className="divide-y divide-border border-y border-border">
          {skillGroups.map((group) => (
            <div key={group.title} className="reveal grid md:grid-cols-[200px_1fr] gap-3 md:gap-8 py-6">
              <dt className="text-xs font-mono text-text-faint uppercase tracking-widest pt-1.5">
                <T en={group.title} hi={GROUP_HI[group.title] ?? group.title} />
              </dt>
              <dd className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-sm font-body text-text-secondary bg-surface border border-border rounded"
                  >
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
