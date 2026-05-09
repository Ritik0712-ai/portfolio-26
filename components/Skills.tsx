'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Palette, Server, Brain, Wrench } from 'lucide-react'

const skillCategories = [
  {
    title: 'Languages',
    icon: Code,
    skills: [
      { name: 'Java', level: 90, context: 'Primary language, used in 3 major projects' },
      { name: 'JavaScript', level: 85, context: 'Full-stack development' },
      { name: 'TypeScript', level: 80, context: 'Next.js projects' },
      { name: 'SQL', level: 75, context: 'Database queries & optimization' },
      { name: 'Python', level: 70, context: 'Data analysis & scripting' },
    ],
  },
  {
    title: 'Frontend',
    icon: Palette,
    skills: [
      { name: 'React', level: 90, context: 'Used in 4 projects' },
      { name: 'Next.js', level: 85, context: 'Primary framework for web apps' },
      { name: 'Tailwind CSS', level: 90, context: 'All recent projects' },
      { name: 'React Native', level: 65, context: 'MindSpace mobile app' },
    ],
  },
  {
    title: 'Backend',
    icon: Server,
    skills: [
      { name: 'Node.js', level: 80, context: 'MindSpace backend' },
      { name: 'Express', level: 75, context: 'API development' },
      { name: 'PostgreSQL', level: 70, context: 'StockSchool database' },
      { name: 'Redis', level: 60, context: 'Caching & real-time features' },
    ],
  },
  {
    title: 'DSA & CS',
    icon: Brain,
    skills: [
      { name: 'Graphs', level: 85, context: 'Pathfinding, social networks' },
      { name: 'Trees', level: 80, context: 'Binary trees, tries' },
      { name: 'Dynamic Programming', level: 75, context: 'Optimization problems' },
      { name: 'Recursion', level: 85, context: 'Tree traversal, backtracking' },
    ],
  },
  {
    title: 'Tools',
    icon: Wrench,
    skills: [
      { name: 'Git', level: 90, context: 'Version control' },
      { name: 'Vercel', level: 85, context: 'Deployment platform' },
      { name: 'Docker', level: 60, context: 'Containerization' },
      { name: 'AWS', level: 50, context: 'Cloud services' },
    ],
  },
]

function SkillBar({ name, level, context }: { name: string; level: number; context: string }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), 100)
    return () => clearTimeout(timer)
  }, [level])

  return (
    <div className="group mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
          {name}
        </span>
        <span className="text-xs text-text-muted">{level}%</span>
      </div>
      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>
      <span className="text-xs text-text-muted mt-1 block">{context}</span>
    </div>
  )
}

export default function Skills() {
  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Skills & Technologies</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            My technical toolkit — constantly growing and improving.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-4" />
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
              className="bg-card/50 rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {category.title}
                </h3>
              </div>

              {/* Skills List */}
              <div>
                {category.skills.map((skill) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    context={skill.context}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
