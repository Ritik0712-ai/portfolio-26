'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Co-Founder at HealthTech Startup',
    content: 'Ritik built our MVP in record time. His understanding of both frontend and backend architecture saved us months of development.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Arjun Mehta',
    role: 'Senior Engineer at Google',
    content: 'One of the most dedicated developers I\'ve mentored. His portfolio projects showcase a rare combination of technical skill and product thinking.',
    rating: 5,
    avatar: 'AM',
  },
  {
    name: 'Sneha Patel',
    role: 'Product Manager at Startup',
    content: 'Ritik doesn\'t just write code — he thinks about the user. Every feature he built had the end-user experience in mind.',
    rating: 5,
    avatar: 'SP',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">What People Say</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Don't take my word for it — here's what collaborators have to say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              
              <div className="relative h-full bg-card/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300">
                {/* Quote icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-text-muted mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{testimonial.name}</p>
                    <p className="text-sm text-text-muted">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
