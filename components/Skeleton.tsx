'use client'

import { motion } from 'framer-motion'

export function ProjectSkeleton() {
  return (
    <motion.div
      className="bg-surface rounded-xl p-6 border border-border animate-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-6 bg-bg-secondary rounded w-1/3 mb-4" />
      <div className="h-4 bg-bg-secondary rounded w-full mb-2" />
      <div className="h-4 bg-bg-secondary rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-bg-secondary rounded" />
        <div className="h-6 w-16 bg-bg-secondary rounded" />
      </div>
    </motion.div>
  )
}

export function BlogSkeleton() {
  return (
    <motion.div
      className="bg-surface rounded-xl p-6 border border-border animate-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-bg-secondary rounded" />
        <div className="h-6 w-16 bg-bg-secondary rounded" />
      </div>
      <div className="h-7 bg-bg-secondary rounded w-3/4 mb-3" />
      <div className="h-4 bg-bg-secondary rounded w-full mb-2" />
      <div className="h-4 bg-bg-secondary rounded w-2/3 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-bg-secondary rounded" />
        <div className="h-4 w-20 bg-bg-secondary rounded" />
      </div>
    </motion.div>
  )
}

export function ProfileSkeleton() {
  return (
    <motion.div
      className="bg-surface rounded-xl p-6 border border-border animate-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 bg-bg-secondary rounded-full" />
        <div className="flex-1">
          <div className="h-8 bg-bg-secondary rounded w-1/2 mb-2" />
          <div className="h-4 bg-bg-secondary rounded w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-bg-secondary rounded-lg" />
        ))}
      </div>
    </motion.div>
  )
}
