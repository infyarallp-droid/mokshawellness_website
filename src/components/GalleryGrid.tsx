'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { GalleryItem } from '@/lib/content';

/** Photo/video grid with an accessible lightbox (arrow keys, Escape, swipe-friendly buttons). */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  const current = open != null ? items[open] : null;
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((g, i) => (
          <li key={g.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-2xl bg-sage text-left focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`Open ${g.alt || g.caption || (g.kind === 'VIDEO' ? 'video' : 'photo')}`}
            >
              {g.kind === 'IMAGE' ? (
                <Image src={g.url} alt={g.alt ?? ''} width={800} height={600} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-auto w-full transition duration-500 group-hover:scale-[1.02]" />
              ) : (
                <span className="relative block">
                  <video src={g.url} poster={g.posterUrl ?? undefined} muted playsInline preload="metadata" className="w-full" />
                  <span className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-cream/95 text-forest">▶</span>
                  </span>
                </span>
              )}
              {g.caption && <span className="block px-4 py-3 text-sm text-ink/70">{g.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.caption ?? 'Gallery'} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <div className="relative max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {current.kind === 'IMAGE' ? (
              <Image src={current.url} alt={current.alt ?? ''} width={1600} height={1200} sizes="100vw" className="mx-auto max-h-[80vh] w-auto rounded-xl object-contain" />
            ) : (
              <video src={current.url} poster={current.posterUrl ?? undefined} controls autoPlay playsInline className="mx-auto max-h-[80vh] rounded-xl" />
            )}
            {current.caption && <p className="mt-3 text-center text-sm text-cream/80">{current.caption}</p>}
          </div>
          <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20">
            ×
          </button>
          {items.length > 1 && (
            <>
              <button type="button" onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Previous" className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20">
                ‹
              </button>
              <button type="button" onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Next" className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20">
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
