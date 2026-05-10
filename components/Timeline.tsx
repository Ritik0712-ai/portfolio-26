'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Code, GraduationCap, Rocket, Heart, Briefcase } from 'lucide-react'

const timeline = [
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Started Coding',
    description: 'Wrote my first "Hello World" and fell in love with technology.',
    date: '2019',
    type: 'education',
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: 'First Freelance Project',
    description: 'Built a website for a local business. Got paid in pizza and experience.',
    date: '2020',
    type: 'work',
  },
  {
    icon: <Rocket className="w-5 h-5" />,
    title: 'Shipped First Product',
    description: 'MindSpace mental health app. 500+ users in the first month.',
    date: '2024',
    type: 'project',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Tech Internship',
    description: 'Joined a startup as a full-stack developer. Learned production-scale systems.',
    date: '2025',
    type: 'work',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Still Building',
    description: 'Every day is a chance to create something meaningful.',
    date: 'Present',
    type: 'current',
  },
]

const typeColors = {
  education: 'from-blue-500 to-cyan-500',
  work: 'from-purple-500 to-pink-500',
  project: 'from-primary to-accent',
  current: 'from-green-500 to-emerald-500',
}

export default function Timeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">The Journey</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            From writing "Hello World" to shipping products that matter.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary transform -translate-x-1/2 hidden md:block" />

          {timeline.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative flex items-center gap-8 mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-8 md:pl-0`}>
                <div className={`inline-block px-4 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${typeColors[item.type as keyof typeof typeColors]} mb-2`}>
                  {item.date}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-text-muted">{item.description}</p>
              </div>

              {/* Center dot */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/30 z-10">
                {item.icon}
              </div>

              {/* Spacer for opposite side */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
