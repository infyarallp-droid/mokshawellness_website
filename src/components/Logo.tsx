import Image from 'next/image';
import { site } from '@/content/site';

const MARK = { src: '/logo-mark.png', width: 535, height: 476 };

/**
 * The lotus-and-figure mark from the logo, drawn in the current text colour
 * (the logo file is used as a mask). For watermarks and decoration; use
 * <LogoMark /> where the real two-colour mark should show.
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

/** The mark in its real colours (green lotus, maroon bindu). */
export function LogoMark({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return <Image src={MARK.src} alt="" width={MARK.width} height={MARK.height} priority={priority} className={className} />;
}

/** Full stacked logo, for places with room for it. */
export function FullLogo({ className = '' }: { className?: string }) {
  return <Image src="/logo.png" alt={`${site.name} — ${site.tagline}`} width={818} height={878} className={className} />;
}

/** Horizontal lockup for the header and footer: the mark beside the name. */
export default function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <span className={`flex items-center gap-3 ${light ? 'text-cream' : 'text-forest'}`}>
      {light ? <LotusMark className="h-11 w-12" /> : <LogoMark priority className="h-11 w-auto" />}
      <span className="leading-none">
        <span className="block font-display text-[1.35rem] font-semibold uppercase tracking-[0.06em]">Moksha</span>
        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.3em]">
          <span className={`h-px w-3 ${light ? 'bg-cream/50' : 'bg-clay'}`} />
          Wellness
          <span className={`h-px w-3 ${light ? 'bg-cream/50' : 'bg-clay'}`} />
        </span>
      </span>
    </span>
  );
}
