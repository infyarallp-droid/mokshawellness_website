import Link from 'next/link';
import type { ReactNode } from 'react';
import { FullLogo } from '@/components/Logo';

/** Shared frame for sign-in / sign-up / account-completion pages. */
export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-sand blur-3xl" />
      <div aria-hidden="true" className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-sage/80 blur-3xl" />
      <div className="container-page relative flex justify-center py-12 sm:py-20">
        <div className="w-full max-w-md">
          <Link href="/" className="mx-auto mb-8 block w-40" aria-label="Moksha Wellness — home">
            <FullLogo className="h-auto w-full" priority />
          </Link>
          <div className="rounded-[2rem] border border-forest/10 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgb(var(--forest)/0.45)] backdrop-blur sm:p-8">
            <h1 className="text-3xl font-medium">{title}</h1>
            {subtitle && <div className="mt-2 text-ink/70">{subtitle}</div>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-ink/70">{footer}</div>}
        </div>
      </div>
    </section>
  );
}

export function GoogleButton({ href, label = 'Continue with Google' }: { href: string; label?: string }) {
  return (
    <a href={href} className="btn w-full border border-forest/20 bg-white text-ink hover:border-forest/40 hover:bg-cream">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.6 44 33.5 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </a>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-ink/40">
      <span className="h-px flex-1 bg-forest/10" />
      or
      <span className="h-px flex-1 bg-forest/10" />
    </div>
  );
}

const MESSAGES: Record<string, string> = {
  'google-unavailable': 'Google sign-in is not available yet. Please use your mobile number.',
  'google-cancelled': 'Google sign-in was cancelled.',
  'google-expired': 'That sign-in took too long or was opened in another browser. Please try again.',
  'google-failed': 'Google sign-in failed. Please try again.',
};

export function urlError(code: string | undefined): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? (code.length < 300 ? code : 'Something went wrong. Please try again.');
}
