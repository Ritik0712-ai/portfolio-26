'use client'

import { motion } from 'framer-motion'
import { Coffee, Moon, Bug, Sparkles } from 'lucide-react'
import Image from 'next/image'

const personalityTraits = [
  { icon: Coffee, text: "Coffee enthusiast — code doesn't compile without it" },
  { icon: Moon, text: "Sleep lover — debugs better after a night of rest" },
  { icon: Bug, text: "Bug hunter — every error is just a puzzle waiting to be solved" },
  { icon: Sparkles, text: "Learns in public — sharing the journey, not just the destination" },
]

const timeline = [
  {
    year: '2024',
    title: 'Started at VIT Bhopal',
    description: 'Joined Computer Science & Engineering (4-year program). First encounter with "real" programming.',
  },
  {
    year: '2024',
    title: 'Built First Project',
    description: 'Shipped MindSpace — a mental health app for the Indian context.',
  },
  {
    year: '2024',
    title: 'StockSchool Launch',
    description: 'Jargon-free stock education platform with paper trading simulator.',
  },
  {
    year: 'Now',
    title: 'Building & Learning',
    description: 'Grinding DSA while shipping products. Looking for internship opportunities.',
  },
]

export default function About() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">About Me</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Bio & Photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Photo */}
            <div className="relative w-48 h-48 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-primary/20">
              <Image 
                src="/profile.jpg" 
                alt="Ritik Agarwal" 
                fill 
                className="object-cover"
              />
            </div>

            {/* Currently badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Open to internships</span>
            </div>

            {/* Bio */}
            <div className="space-y-4 text-text-muted">
              <p>
                I'm a CS student at VIT Bhopal who believes in building products that solve
                real problems — starting with my own. From a mental health app for Indians
                to a stock trading simulator, I turn coffee into code and bugs into features.
              </p>
              <p>
                My journey started with curiosity and has evolved into a passion for
                full-stack development. I don't just learn technologies — I ship them.
                Every project is a chance to learn something new and share it with others.
              </p>
            </div>

            {/* Personality Traits */}
            <div className="space-y-3 pt-4">
              {personalityTraits.map((trait, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <trait.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-text-muted">{trait.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent" />
            
            <div className="space-y-8 pl-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[2.125rem] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary" />
                  
                  {/* Year */}
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {item.year}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-text-primary mt-1">
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-text-muted mt-1">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
