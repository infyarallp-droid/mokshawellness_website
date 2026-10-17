import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { TeamCard } from '@/components/People';
import { CtaBand, PageHero, SectionHeading } from '@/components/ui';
import { FullLogo } from '@/components/Logo';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description: 'What Moksha Wellness stands for: steady practice, careful teaching and respect for every body.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const s = await getSite();
  const a = s.block('about.page');
  return (
    <>
      <PageHero eyebrow={a.heroEyebrow} title={a.heroTitle}>
        {a.heroBody && <p>{a.heroBody}</p>}
      </PageHero>

      <section className="container-page grid items-center gap-12 pb-16 sm:pb-24 lg:grid-cols-2">
        <Reveal>
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sage to-sand">
            {a.imageUrl ? (
              <Image src={a.imageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            ) : (
              <FullLogo className="h-auto w-[52%] max-w-[17rem]" />
            )}
          </div>
        </Reveal>
        <div>
          <SectionHeading eyebrow={a.offerEyebrow} title={a.offerTitle}>
            {a.offerParagraphs.map((p, i) => (
              <p key={i} className={i ? 'mt-4' : ''}>
                {p}
              </p>
            ))}
          </SectionHeading>
        </div>
      </section>

      {a.values.length > 0 && (
        <section className="bg-sand/45 py-16 sm:py-24">
          <div className="container-page">
            <SectionHeading eyebrow={a.valuesEyebrow} title={a.valuesTitle} />
            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {a.values.map((v, i) => (
                <Reveal key={`${v.title}-${i}`} delay={(i % 2) * 90}>
                  <div className="flex gap-5">
                    <span className="font-display text-3xl text-brand/50">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-2xl font-medium">{v.title}</h3>
                      <p className="mt-2 leading-relaxed text-ink/75">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {s.team.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={s.block('home.sections').teamEyebrow} title={s.block('home.sections').teamTitle} />
            {s.team.length > 3 && (
              <Link href="/team" className="btn-ghost">
                Meet the whole team
              </Link>
            )}
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.team.slice(0, 3).map((m, i) => (
              <TeamCard key={m.id} member={m} index={i} />
            ))}
          </div>
        </section>
      )}

      <CtaBand title={a.ctaTitle}>{a.ctaBody && <p>{a.ctaBody}</p>}</CtaBand>
    </>
  );
}
