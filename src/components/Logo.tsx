import Image from 'next/image';
import { site } from '@/content/site';
import logoFull from '@/assets/brand/logo.png';
import logoFullWhite from '@/assets/brand/logo-white.png';
import logoMark from '@/assets/brand/logo-mark.png';
import logoMarkWhite from '@/assets/brand/logo-mark-white.png';

// Logo files live in src/assets/brand (generated from the official logo, ESTD 2025) and are
// imported, so every version gets a content-hashed URL and no cache can ever show an old logo.
//   logo.png / logo-white.png            full stacked logo (colour / for dark backgrounds)  1200×1099
//   logo-mark.png / logo-mark-white.png  lotus mark only                                    640×563
// Copies in /public (logo.png, logo-mark.png) are only for external use: search engines, Razorpay.
const MARK = { src: logoMark, white: logoMarkWhite };
const FULL = { src: logoFull, white: logoFullWhite };

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
        maskImage: `url(${MARK.src.src})`,
        WebkitMaskImage: `url(${MARK.src.src})`,
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
      alt={`${site.name} — established 2025`}
      priority={priority}
      sizes="(max-width: 640px) 60vw, 320px"
      className={className}
    />
  );
}

/** The official logo artwork for the header (colour) and footer (white). */
export default function Logo({ tone = 'dark', className = 'h-16 w-auto sm:h-[4.75rem]' }: { tone?: 'dark' | 'light'; className?: string }) {
  const light = tone === 'light';
  return <FullLogo tone={light ? 'white' : 'colour'} priority={!light} className={className} />;
}
