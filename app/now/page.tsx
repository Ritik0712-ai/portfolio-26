'use client';

import { motion } from 'framer-motion';
import { Code, Book, Lightbulb, Target, Calendar } from 'lucide-react';

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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">/now</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-2">
            What I&apos;m doing now
          </h1>
          <div className="flex items-center gap-2 text-sm text-text-muted font-body">
            <Calendar className="w-4 h-4" />
            Last updated {nowData.lastUpdated}
          </div>
        </motion.div>

        {/* Focus */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-wider">This Month&apos;s Focus</p>
          </div>
          <p className="text-lg font-body text-text-primary leading-relaxed">{nowData.thisMonthsFocus}</p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Building */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                <Code className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs font-mono text-text-faint uppercase tracking-wider">Building</p>
            </div>
            <ul className="space-y-3">
              {nowData.currentlyBuilding.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-body text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Learning */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs font-mono text-text-faint uppercase tracking-wider">Learning</p>
            </div>
            <ul className="space-y-3">
              {nowData.currentlyLearning.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-body text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Reading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-surface border border-border rounded-lg p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                <Book className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs font-mono text-text-faint uppercase tracking-wider">Reading</p>
            </div>
            <ul className="grid md:grid-cols-3 gap-3">
              {nowData.currentlyReading.map((book) => (
                <li key={book} className="flex items-start gap-3 text-sm font-body text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  {book}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-surface border border-border rounded-lg">
          <p className="text-sm text-text-muted font-body text-center leading-relaxed">
            This page is inspired by Derek Sivers&apos; <a href="https://sivers.org/now" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">/now</a> page idea.
            I believe in transparency and showing the work in progress.
            If you&apos;re interested in collaborating, <a href="/contact" className="text-accent hover:underline">let&apos;s talk</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
