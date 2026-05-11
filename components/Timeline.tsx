'use client'

import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Code, GraduationCap, Rocket, Heart, Briefcase, Users, Coffee, Lightbulb } from 'lucide-react'

interface TimelineEvent {
  id: string
  icon: string
  title: string
  description: string
  event_date: string
  event_type: string
  display_order: number
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
}

export default function Timeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    fetch('/api/admin/timeline')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events)
      })
      .catch(console.error)
  }, [])

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
            <span className="gradient-text">My Journey</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            From curious beginner to building real products.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
                    <span className="inline-block px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full mb-3">
                      {event.event_date}
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                  {iconMap[event.icon] || <Code className="w-5 h-5" />}
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
