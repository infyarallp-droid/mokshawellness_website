import Image from 'next/image';
import { site } from '@/content/site';

// Logo files (generated from the official vector logo, ESTD 2025):
//   /logo.png             full stacked logo, colour, transparent      1200×998
//   /logo-white.png       full stacked logo for dark backgrounds      1200×998
//   /logo-mark.png        lotus mark only, colour                       640×484
//   /logo-mark-white.png  lotus mark only, white                        640×484
const MARK = { src: '/logo-mark.png', white: '/logo-mark-white.png', width: 640, height: 484 };
const FULL = { src: '/logo.png', white: '/logo-white.png', width: 1200, height: 998 };

/**
 * The lotus mark drawn in the current text colour (the logo file is used as a
 * mask). For watermarks and decoration; use <LogoMark /> for the real mark.
 */
export function LotusMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-current ${className}`}
      style={{
        maskImage: `url(${MARK.src})`,
        WebkitMaskImage: `url(${MARK.src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

/** The mark in its real colours (green lotus, red bindu), or white for dark backgrounds. */
export function LogoMark({ className = '', priority = false, tone = 'colour' }: { className?: string; priority?: boolean; tone?: 'colour' | 'white' }) {
  return (
    <Image
      src={tone === 'white' ? MARK.white : MARK.src}
      alt=""
      width={MARK.width}
      height={MARK.height}
      priority={priority}
      sizes="(max-width: 640px) 120px, 240px"
      className={className}
    />
  );
}

/** Full stacked logo, for places with room for it. */
export function FullLogo({ className = '', tone = 'colour', priority = false }: { className?: string; tone?: 'colour' | 'white'; priority?: boolean }) {
  return (
    <Image
      src={tone === 'white' ? FULL.white : FULL.src}
      alt={`${site.name} — ${site.tagline}`}
      width={FULL.width}
      height={FULL.height}
      priority={priority}
      sizes="(max-width: 640px) 60vw, 320px"
      className={className}
    />
  );
}

/** Horizontal lockup for the header and footer: the mark beside the name. */
export default function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <span className={`flex items-center gap-2.5 ${light ? 'text-cream' : 'text-forest'}`}>
      <LogoMark priority={!light} tone={light ? 'white' : 'colour'} className="h-11 w-auto" />
      <span className="leading-none">
        <span className="block font-display text-[1.35rem] font-semibold uppercase tracking-[0.06em]">Moksha</span>
        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.3em]">
          <span className={`h-px w-3 ${light ? 'bg-cream/50' : 'bg-bindu'}`} />
          Wellness
          <span className={`h-px w-3 ${light ? 'bg-cream/50' : 'bg-bindu'}`} />
        </span>
      </span>
    </span>
  );
}
