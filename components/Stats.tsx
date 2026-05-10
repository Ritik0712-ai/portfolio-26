'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Code, Users, Globe, Coffee } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { icon: <Code className="w-6 h-6" />, value: 15, suffix: '+', label: 'Projects Shipped' },
  { icon: <Users className="w-6 h-6" />, value: 1000, suffix: '+', label: 'Users Reached' },
  { icon: <Globe className="w-6 h-6" />, value: 5, suffix: '', label: 'Countries Served' },
  { icon: <Coffee className="w-6 h-6" />, value: 500, suffix: '+', label: 'Cups of Coffee' },
]

function Counter({ value, suffix, isInView }: { value: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    
    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, value])

  return <span>{count}{suffix}</span>
}

function StatCard({ stat, index, isInView }: { stat: StatItem; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 text-center hover:border-primary/40 transition-all duration-300">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
          {stat.icon}
        </div>
        
        <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          <Counter value={stat.value} suffix={stat.suffix} isInView={isInView} />
        </div>
        
        <p className="text-text-muted text-sm uppercase tracking-wider">{stat.label}</p>
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Numbers Don't Lie</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Well, maybe they do, but these look impressive on a portfolio.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
}
