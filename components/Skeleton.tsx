'use client'

import { motion } from 'framer-motion'

export function ProjectSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 border border-primary/10 animate-pulse">
      <div className="h-6 bg-primary/10 rounded w-1/3 mb-4" />
      <div className="h-4 bg-primary/10 rounded w-full mb-2" />
      <div className="h-4 bg-primary/10 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-primary/10 rounded" />
        <div className="h-6 w-16 bg-primary/10 rounded" />
      </div>
    </div>
  )
}

export function BlogSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 border border-primary/10 animate-pulse">
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-primary/10 rounded" />
        <div className="h-6 w-16 bg-primary/10 rounded" />
      </div>
      <div className="h-7 bg-primary/10 rounded w-3/4 mb-3" />
      <div className="h-4 bg-primary/10 rounded w-full mb-2" />
      <div className="h-4 bg-primary/10 rounded w-2/3 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-primary/10 rounded" />
        <div className="h-4 w-20 bg-primary/10 rounded" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 border border-primary/10 animate-pulse">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full" />
        <div className="flex-1">
          <div className="h-8 bg-primary/10 rounded w-1/2 mb-2" />
          <div className="h-4 bg-primary/10 rounded w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-primary/10 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
