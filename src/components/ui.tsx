import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Programme } from '@/content/programmes';
import { site } from '@/content/site';
import { rupees, type OnlinePlan } from '@/lib/content';
import { LotusMark } from './Logo';
import heroLogo from '@/assets/brand/logo-yoga-pilates.png';
import Reveal from './Reveal';

/** Layered sunrise circles with the Moksha Wellness "Yoga & Pilates" logo, used in the home hero. */
export function HeroArt() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[30rem]">
      <div className="absolute inset-[6%] animate-breathe rounded-full bg-gradient-to-b from-sand to-sage" />
      <div className="absolute inset-[18%] animate-breathe rounded-full bg-gradient-to-b from-clay/15 to-brand/20 [animation-delay:-3s]" />
      <div className="absolute inset-[22%] rounded-full bg-cream/90 shadow-[0_30px_80px_-20px_rgb(var(--forest)/0.35)]" />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-forest/15" fill="none" stroke="currentColor">
        <circle cx="200" cy="200" r="196" strokeDasharray="2 10" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="150" strokeWidth="1" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <Image src={heroLogo} alt="" priority sizes="(max-width: 1024px) 45vw, 220px" className="h-auto w-[44%] animate-drift" />
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-sage/70 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-sand blur-3xl" />
      <div className="container-page relative pb-14 pt-16 sm:pb-20 sm:pt-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.08] sm:text-6xl">{title}</h1>
        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/75">{children}</div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-[2.6rem]">{title}</h2>
      {children && <div className="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">{children}</div>}
    </Reveal>
  );
}

const MODE_STYLE: Record<string, string> = {
  Studio: 'bg-sand text-forest',
  Online: 'bg-sage text-forest',
  'Studio & Online': 'bg-brand/15 text-forest',
};

export function ProgrammeCard({ programme, index = 0 }: { programme: Programme & { onlinePlans?: OnlinePlan[] }; index?: number }) {
  const plans = programme.onlinePlans ?? [];
  return (
    <Reveal delay={Math.min(index, 5) * 70} className="h-full">
      <article
        id={programme.slug}
        className="group flex h-full scroll-mt-28 flex-col rounded-3xl border border-forest/10 bg-white/70 p-7 transition duration-300 hover:-translate-y-1 hover:border-forest/25 hover:bg-white hover:shadow-[0_24px_60px_-28px_rgb(var(--forest)/0.45)]"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-forest px-3 py-1 text-cream">{programme.discipline}</span>
          <span className={`rounded-full px-3 py-1 ${programme.mode ? MODE_STYLE[programme.mode] : 'border border-forest/15 text-ink/60'}`}>
            {programme.mode ?? 'Ask us about format'}
          </span>
        </div>
        <h3 className="mt-5 text-2xl font-medium leading-snug">{programme.name}</h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75">{programme.summary}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">{programme.forWhom}</p>
        {plans.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-forest/10 pt-4" aria-label="Plans you can join online">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink/70">{p.title}</span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-forest">{rupees(p.pricePaise)}</span>
                  <Link
                    href={`/checkout?plan=${p.id}`}
                    className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-cream transition hover:bg-brand"
                    aria-label={`Join ${programme.name}, ${p.title}, online`}
                  >
                    Join online
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-6">
          <Link
            href={`/contact?interest=${programme.slug}#enquire`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition group-hover:gap-2.5"
          >
            Ask about schedule &amp; fees <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export function CtaBand({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-page py-16 sm:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-forest px-7 py-14 text-cream sm:px-16 sm:py-20">
          <LotusMark className="absolute -right-10 -top-10 h-64 w-64 text-cream/[0.07]" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-medium leading-tight text-cream sm:text-5xl">{title}</h2>
            <div className="mt-5 text-lg leading-relaxed text-cream/75">{children}</div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact#enquire" className="btn-light">
                Send an enquiry
              </Link>
              <Link href="/classes" className="btn border border-cream/30 text-cream hover:bg-cream/10">
                See all classes
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-forest/10 border-y border-forest/10">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg font-display text-xl text-forest [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-forest/20 text-lg transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink/75">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Shown while an admin previews unpublished drafts. */
export function PreviewBanner() {
  return (
    <div className="bg-amber-300 text-amber-950">
      <p className="container-page flex flex-wrap items-center justify-center gap-3 py-2 text-center text-sm font-medium">
        Preview — you are seeing unpublished drafts.
        <a href="/api/preview/exit" className="underline underline-offset-4">
          Exit preview
        </a>
      </p>
    </div>
  );
}

