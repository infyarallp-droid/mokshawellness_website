import type { ReactNode } from 'react';
import { site } from '@/content/site';

// Floating contact shortcuts (bottom-right of every page). Each button appears
// only when its link is filled in: admin panel → Website → Page Content →
// "Contact details & footer".

export interface ContactLinks {
  whatsapp: string | null;
  instagram: string;
  facebook: string;
  youtube: string;
  google: string;
  website: string;
}

const ICONS: Record<string, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.6 44 33.5 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </svg>
  ),
};

const BUTTONS: { key: Exclude<keyof ContactLinks, 'whatsapp'>; label: string; className: string }[] = [
  { key: 'instagram', label: 'Instagram', className: 'bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white' },
  { key: 'facebook', label: 'Facebook', className: 'bg-[#1877f2] text-white' },
  { key: 'youtube', label: 'YouTube', className: 'bg-[#ff0000] text-white' },
  { key: 'google', label: 'Google (directions & reviews)', className: 'bg-white ring-1 ring-forest/10' },
  { key: 'website', label: 'Website', className: 'bg-forest text-cream' },
];

export default function ContactButtons({ links }: { links: ContactLinks }) {
  const shown = BUTTONS.filter((b) => links[b.key]);
  if (!shown.length && !links.whatsapp) return null;
  return (
    <nav aria-label="Contact and social links" className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-2.5">
      {shown.map((b) => (
        <a
          key={b.key}
          href={links[b.key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${site.name} on ${b.label}`}
          title={b.label}
          className={`grid h-11 w-11 place-items-center rounded-full shadow-md transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand ${b.className}`}
        >
          {ICONS[b.key]}
        </a>
      ))}
      {links.whatsapp && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with ${site.name} on WhatsApp`}
          title="WhatsApp"
          className="grid h-14 w-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-lg transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
        </a>
      )}
    </nav>
  );
}
