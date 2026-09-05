'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/#projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/github', label: 'GitHub' },
  { href: '/resume', label: 'Resume' },
  { href: '/now', label: 'Now' },
  { href: '/contact', label: 'Contact' },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <nav className={[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-slow',
      isScrolled ? 'bg-bg/90 backdrop-blur-sm border-b border-border' : 'bg-transparent',
    ].join(' ')}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Monogram */}
          <Link href="/" className="font-display font-semibold text-lg text-text-primary tracking-wide">
            RA
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-body text-text-muted hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Social + Theme */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-text-muted hover:text-text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-text-muted hover:text-text-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-surface border-t border-border">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-body text-text-muted hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-3 border-t border-border mt-3">
              <a href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary">
                <Linkedin className="w-4 h-4" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
