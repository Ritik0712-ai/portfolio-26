'use client'

import { motion } from 'framer-motion'
import GitHubTracker from '@/components/GitHubTracker'
import { Github } from 'lucide-react'

export default function GitHubPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">GitHub Tracker</span>
            </h1>
          </div>
          <p className="text-text-muted max-w-2xl">
            My open source activity, repositories, and contribution history. Updated hourly.
          </p>
        </motion.div>

        {/* GitHub Tracker Component */}
        <GitHubTracker />
      </div>
    </div>
  )
}
