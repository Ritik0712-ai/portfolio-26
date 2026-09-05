'use client';

import Image from 'next/image';
import { Coffee, Moon, Bug, Sparkles } from 'lucide-react';

const personalityTraits = [
  { icon: Coffee, text: 'Coffee enthusiast — code doesn\'t compile without it' },
  { icon: Moon, text: 'Sleep lover — debugs better after a night of rest' },
  { icon: Bug, text: 'Bug hunter — every error is just a puzzle waiting to be solved' },
  { icon: Sparkles, text: 'Learns in public — sharing the journey, not just the destination' },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Profile */}
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-4">About</p>
            <div className="relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-bg-tertiary">
                <Image
                  src="/profile.jpg"
                  alt="Ritik Agarwal"
                  width={400}
                  height={533}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-surface border border-border rounded-lg px-4 py-3 shadow-md">
                <p className="text-xs text-text-faint font-body">Available for</p>
                <p className="text-sm font-medium text-text-primary">Internships & Projects</p>
              </div>
            </div>

            {/* Personality */}
            <div className="mt-8 space-y-3">
              {personalityTraits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-text-secondary font-body">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio */}
          <div className="pt-8 md:pt-20">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-6 leading-tight">
              CS student building products that matter
            </h2>
            <div className="space-y-4 text-base text-text-secondary font-body leading-relaxed">
              <p>
                I'm a Computer Science student in India who got tired of tutorials and decided to build real things instead. My first project, MindSpace, tried to make mental health support actually accessible in a country where therapy costs more than most people's rent.
              </p>
              <p>
                That project didn't become a unicorn, but it taught me more about product design, user empathy, and shipping under pressure than any course ever could.
              </p>
              <p>
                Now I work on projects that blend technology with real human needs — fintech for financial literacy, developer tools, and whatever interesting problem lands on my desk.
              </p>
              <p>
                When I'm not building, I'm either grinding LeetCode (I know, I know), reading about system design, or trying to explain to my parents why "just making an app" takes longer than "just writing a document."
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4">Quick Facts</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Based in', value: 'India' },
                  { label: 'Education', value: 'CS Student' },
                  { label: 'Languages', value: 'Java, TS, Python' },
                  { label: 'Focus', value: 'Product Engineering' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-text-faint font-body">{f.label}</p>
                    <p className="text-sm font-medium text-text-primary font-body">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
