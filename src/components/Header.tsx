'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav } from '@/content/site';
import Logo from './Logo';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; Escape closes it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-forest/10 bg-cream/90 backdrop-blur-md' : 'border-b border-transparent bg-cream/0'
      }`}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between">
        <Link href="/" aria-label="Moksha Wellness — home" onClick={() => setOpen(false)} className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(item.href) ? 'bg-forest/10 text-forest' : 'text-ink/70 hover:text-forest'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact#enquire" className="btn-primary ml-3 !py-2.5">
            Enquire now
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-forest md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="container-page flex h-[calc(100dvh-4.5rem)] flex-col gap-1 pb-10 pt-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="border-b border-forest/10 py-4 font-display text-2xl text-forest"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact#enquire" onClick={() => setOpen(false)} className="btn-primary mt-6">
            Enquire now
          </Link>
        </nav>
      )}
    </header>
  );
}
