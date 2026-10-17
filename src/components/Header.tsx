'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { NavItem } from '@/content/site';
import Logo from './Logo';

/** The httpOnly session cookie is invisible to scripts; this harmless hint cookie only switches the label. */
const noSubscribe = () => () => undefined;
function useSignedIn() {
  // Server render (and the first client render) say "Sign in"; the cookie is read after hydration.
  return useSyncExternalStore(
    noSubscribe,
    () => document.cookie.split('; ').some((c) => c === 'mw_signed_in=1'),
    () => false,
  );
}

export default function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useSignedIn();

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
  const account = signedIn ? { href: '/account', label: 'My account' } : { href: '/login', label: 'Sign in' };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-forest/10 bg-cream/90 backdrop-blur-md' : 'border-b border-transparent bg-cream/0'
      }`}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Moksha Wellness — home" onClick={() => setOpen(false)} className="shrink-0 rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                isActive(item.href) ? 'bg-forest/10 text-forest' : 'text-ink/70 hover:text-forest'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={account.href}
            aria-current={isActive(account.href) ? 'page' : undefined}
            className="ml-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-forest hover:bg-forest/5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" strokeLinecap="round" />
            </svg>
            {account.label}
          </Link>
          <Link href="/contact#enquire" className="btn-primary ml-2 !py-2.5">
            Enquire now
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-forest lg:hidden"
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
        <nav id="mobile-menu" aria-label="Mobile" className="container-page flex h-[calc(100dvh-4.5rem)] flex-col gap-1 overflow-y-auto pb-10 pt-4 lg:hidden">
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
          <Link href={account.href} onClick={() => setOpen(false)} className="border-b border-forest/10 py-4 font-display text-2xl text-forest">
            {account.label}
          </Link>
          <Link href="/contact#enquire" onClick={() => setOpen(false)} className="btn-primary mt-6">
            Enquire now
          </Link>
        </nav>
      )}
    </header>
  );
}
