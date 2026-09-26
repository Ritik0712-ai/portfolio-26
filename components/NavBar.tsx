'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Menu, X, Search, Sparkles } from 'lucide-react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/#projects', label: 'Projects' },
  { href: '/#experience', label: 'Experience' },
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
            <Link
              href="/magic"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-body font-medium rounded-full text-bg bg-text-primary hover:opacity-90 transition-opacity"
              title="Explore this portfolio as a desktop OS"
            >
              <Sparkles className="w-3.5 h-3.5" /> Magic
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
              className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 text-xs font-body text-text-muted border border-border rounded hover:text-text-primary hover:border-rule transition-colors"
              aria-label="Open command menu"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="font-mono text-[10px] text-text-faint border border-border rounded px-1">⌘K</kbd>
            </button>
            <a href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-text-muted hover:text-text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-text-muted hover:text-text-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <ThemeToggle />
          </div>

          {/* Mobile: search + menu */}
          <button
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="md:hidden ml-auto p-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
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
            <Link href="/magic" className="py-2 text-sm font-body text-text-primary inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Magic — desktop mode
            </Link>
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
