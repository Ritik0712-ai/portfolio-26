'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-[150px] font-bold gradient-text leading-none">404</h1>
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
          Page Not Found
        </h2>
        <p className="text-text-muted max-w-md mx-auto mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-primary/20 rounded-lg font-semibold text-text-primary hover:border-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-text-muted">
          <p className="text-sm mb-2">Try searching for what you need:</p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Search className="w-4 h-4" />
            <span>Use the navigation menu to find pages</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
