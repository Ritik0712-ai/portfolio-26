'use client'

import { motion } from 'framer-motion'
import { Code, Book, Lightbulb, Target, Calendar } from 'lucide-react'

const nowData = {
  lastUpdated: 'January 2024',
  currentlyBuilding: [
    'Portfolio website v2 — finally getting around to documenting my work',
    'StockSchool v2 — adding more lesson modules and improving the paper trading engine',
    'DSA practice routine — 2 problems daily, consistent progress over speed',
  ],
  currentlyLearning: [
    'System Design — building scalable architectures for real-world applications',
    'Advanced React patterns — compound components, render props, and custom hooks',
    'PostgreSQL optimization — indexes, query planning, and performance tuning',
  ],
  currentlyReading: [
    'Designing Data-Intensive Applications — Martin Kleppmann',
    'The Pragmatic Programmer — David Thomas & Andrew Hunt',
    'Atomic Habits — James Clear (re-reading)',
  ],
  thisMonthsFocus: 'Ship the portfolio. Document everything. Land an internship.',
}

export default function NowPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">/now</span>
            </h1>
          </div>
          <p className="text-text-muted mb-2">
            What I'm working on right now. Inspired by Derek Sivers'
            <a
              href="https://sivers.org/now"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent ml-1"
            >
              /now page movement
            </a>.
          </p>
          <p className="text-sm text-text-muted flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last updated: {nowData.lastUpdated}
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Currently Building */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Currently Building</h2>
            </div>
            <ul className="space-y-4">
              {nowData.currentlyBuilding.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Currently Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Currently Learning</h2>
            </div>
            <ul className="space-y-4">
              {nowData.currentlyLearning.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Currently Reading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Book className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Currently Reading</h2>
            </div>
            <ul className="space-y-4">
              {nowData.currentlyReading.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* This Month's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">This Month's Focus</h2>
            </div>
            <p className="text-lg text-text-muted leading-relaxed">
              {nowData.thisMonthsFocus}
            </p>
          </motion.div>
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-card/50 rounded-xl border border-primary/10"
        >
          <p className="text-text-muted text-sm text-center">
            This page is updated monthly. I believe in transparency and showing the work in progress.
            If you're interested in collaborating on any of these projects,{' '}
            <a href="/contact" className="text-primary hover:text-accent">
              let's talk
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  )
}
