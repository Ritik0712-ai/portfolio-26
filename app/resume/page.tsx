'use client'

import { motion } from 'framer-motion'
import { Download, FileText, ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export default function ResumePage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-text-muted max-w-2xl">
            My qualifications and experience. Last updated: January 2024.
          </p>
        </motion.div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </a>
          <a
            href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary/50 rounded-lg font-semibold text-text-muted hover:text-primary hover:border-primary transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            LinkedIn Profile
          </a>
        </motion.div>

        {/* Resume Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-8 border border-primary/10"
        >
          {/* Contact Info */}
          <div className="mb-8 pb-6 border-b border-primary/10">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Ritik Agarwal</h2>
            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <a href="mailto:ritikagarwal2468@gmail.com" className="flex items-center gap-1 hover:text-primary">
                <Mail className="w-4 h-4" />
                ritikagarwal2468@gmail.com
              </a>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Agra, India
              </span>
              <a href="tel:+918006711248" className="flex items-center gap-1 hover:text-primary">
                <Phone className="w-4 h-4" />
                +91 8006711248
              </a>
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Education
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-text-primary">Vellore Institute of Technology (VIT) Bhopal</h4>
                  <p className="text-text-muted">Bachelor of Technology in Computer Science & Engineering</p>
                </div>
                <span className="text-sm text-accent">2024 - 2028</span>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Experience
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary">MindSpace — Founder & Developer</h4>
                  <span className="text-sm text-accent">2023 - Present</span>
                </div>
                <ul className="list-disc list-inside text-text-muted space-y-1">
                  <li>Built a mental health support platform for the Indian context</li>
                  <li>Implemented AI-powered journaling using OpenAI GPT-4</li>
                  <li>Designed real-time chat system with Socket.io for peer support</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary">StockSchool — Sole Developer</h4>
                  <span className="text-sm text-accent">2024</span>
                </div>
                <ul className="list-disc list-inside text-text-muted space-y-1">
                  <li>Created a stock education platform with paper trading simulator</li>
                  <li>Integrated Google Gemini AI for personalized learning</li>
                  <li>Built with Next.js 14, Prisma, and PostgreSQL</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Projects
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary">MindSpace</h4>
                <p className="text-text-muted text-sm">Mental health app with AI journaling, peer support, and crisis detection</p>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">StockSchool</h4>
                <p className="text-text-muted text-sm">Stock market education platform with ₹10L paper trading simulator</p>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Portfolio Tracker</h4>
                <p className="text-text-muted text-sm">Investment tracking dashboard (In Progress)</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Technical Skills
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-accent mb-2">Languages</h4>
                <p className="text-text-muted">Java, JavaScript, TypeScript, Python, SQL</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">Frontend</h4>
                <p className="text-text-muted">React, Next.js, React Native, Tailwind CSS</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">Backend</h4>
                <p className="text-text-muted">Node.js, Express, PostgreSQL, Redis, Prisma</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">Tools</h4>
                <p className="text-text-muted">Git, GitHub, Vercel, Railway, VS Code</p>
              </div>
            </div>
          </div>

          {/* DSA */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              DSA & Problem Solving
            </h3>
            <p className="text-text-muted">
              Solved 85+ problems on LeetCode (45 Easy, 35 Medium, 5 Hard).
              Comfortable with Graphs, Trees, Dynamic Programming, and Sorting algorithms.
            </p>
          </div>

          {/* Links */}
          <div className="pt-6 border-t border-primary/10">
            <h3 className="text-xl font-bold text-text-primary mb-4">Links</h3>
            <div className="flex flex-wrap gap-4">
              <a href="https://github.com/ritikagarwal" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
                LinkedIn
              </a>
              <a href="https://x.com/RitikAgarwal07" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
                X
              </a>
              <Link href="/projects" className="text-primary hover:text-accent">
                Portfolio
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom Download */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Resume
          </a>
        </motion.div>
      </div>
    </div>
  )
}
