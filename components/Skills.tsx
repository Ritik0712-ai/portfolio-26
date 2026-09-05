'use client';

import { motion } from 'framer-motion';
import { Code, Palette, Server, Brain } from 'lucide-react';

const skillCategories = [
  {
    title: 'Languages',
    icon: Code,
    skills: [
      { name: 'JavaScript', level: 90, context: 'Full-stack development, 4+ years' },
      { name: 'TypeScript', level: 85, context: 'Next.js, React, 3+ years' },
      { name: 'Python', level: 70, context: 'Data analysis, scripting, automation' },
      { name: 'SQL', level: 75, context: 'PostgreSQL, query optimization' },
      { name: 'Java', level: 65, context: 'Spring Boot, DSA practice' },
    ],
  },
  {
    title: 'Frontend',
    icon: Palette,
    skills: [
      { name: 'React', level: 90, context: '4+ years, component architecture' },
      { name: 'Next.js', level: 85, context: 'App Router, SSR, SSG, API routes' },
      { name: 'Tailwind CSS', level: 90, context: 'All recent projects' },
      { name: 'React Native', level: 60, context: 'MindSpace mobile app' },
    ],
  },
  {
    title: 'Backend',
    icon: Server,
    skills: [
      { name: 'Node.js', level: 80, context: 'Express, REST APIs, Socket.io' },
      { name: 'PostgreSQL', level: 75, context: 'Database design, optimization' },
      { name: 'Redis', level: 65, context: 'Caching, real-time features' },
      { name: 'Supabase', level: 80, context: 'Auth, real-time, storage, edge functions' },
    ],
  },
  {
    title: 'AI & Tools',
    icon: Brain,
    skills: [
      { name: 'OpenAI API', level: 75, context: 'GPT-4, embeddings, prompt engineering' },
      { name: 'Git', level: 85, context: 'Version control, branching strategies' },
      { name: 'Docker', level: 60, context: 'Containerization, basic deployments' },
      { name: 'Vercel', level: 85, context: 'Primary deployment platform' },
    ],
  },
];

function SkillBar({ name, level, context }: { name: string; level: number; context: string }) {
  return (
    <div className="group mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-body text-text-secondary group-hover:text-text-primary transition-colors">
          {name}
        </span>
        <span className="text-xs font-mono text-text-faint">{level}%</span>
      </div>
      <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: level / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          title={context}
        />
      </div>
      <p className="text-xs text-text-faint font-body mt-0.5">{context}</p>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Expertise</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Skills</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-surface border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded bg-bg-secondary flex items-center justify-center">
                  <category.icon className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-text-primary">{category.title}</h3>
              </div>
              {category.skills.map((skill) => (
                <SkillBar key={skill.name} {...skill} />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
