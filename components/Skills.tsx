const skillGroups = [
  {
    title: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
  },
  {
    title: 'Frontend',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'React Native'],
  },
  {
    title: 'Backend & Data',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Supabase', 'MongoDB', 'Redis'],
  },
  {
    title: 'AI & Infra',
    skills: ['OpenAI / Gemini / Groq APIs', 'Git', 'Docker', 'Vercel', 'Render', 'Cloudflare R2'],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Toolkit</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Skills</h2>
        </div>

        <dl className="divide-y divide-border border-y border-border">
          {skillGroups.map((group) => (
            <div key={group.title} className="grid md:grid-cols-[200px_1fr] gap-3 md:gap-8 py-6">
              <dt className="text-xs font-mono text-text-faint uppercase tracking-widest pt-1.5">
                {group.title}
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
