import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { TeamCard, TestimonialCard } from '@/components/People';
import { CtaBand, Faq, HeroArt, ProgrammeCard, SectionHeading } from '@/components/ui';
import { getSite } from '@/lib/content';

export default async function HomePage() {
  const s = await getSite();
  const hero = s.block('home.hero');
  const pillars = s.block('home.pillars');
  const sections = s.block('home.sections');
  const steps = s.block('home.steps');
  const cta = s.block('home.cta');
  const regular = s.programmes.filter((p) => p.category === 'REGULAR');
  const training = s.programmes.filter((p) => p.category === 'TEACHER_TRAINING');
  const faqs = s.faqs('HOME');
  const featured = (s.testimonials.some((t) => t.isFeatured) ? s.testimonials.filter((t) => t.isFeatured) : s.testimonials).slice(0, 3);
  const team = s.team.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-sand blur-3xl" />
        <div aria-hidden="true" className="absolute -right-40 top-40 h-[26rem] w-[26rem] rounded-full bg-sage/80 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
          <div>
            {hero.eyebrow && <p className="eyebrow">{hero.eyebrow}</p>}
            <h1 className="mt-5 text-[2.9rem] font-medium leading-[1.02] sm:text-7xl">
              {hero.title}
              {hero.titleEmphasis && (
                <>
                  {' '}
                  <em className="font-normal italic text-brand">{hero.titleEmphasis}</em>
                </>
              )}
            </h1>
            {hero.body && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl">{hero.body}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              {hero.primaryCtaLabel && hero.primaryCtaHref && (
                <Link href={hero.primaryCtaHref} className="btn-primary">
                  {hero.primaryCtaLabel}
                </Link>
              )}
              {hero.secondaryCtaLabel && hero.secondaryCtaHref && (
                <Link href={hero.secondaryCtaHref} className="btn-ghost">
                  {hero.secondaryCtaLabel}
                </Link>
              )}
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-forest/10 pt-7">
              {[
                [String(regular.length), 'regular classes'],
                [String(training.length), 'training programmes'],
                ['2', 'ways to practise: studio & online'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-4xl text-forest">{value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-ink/60">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          {hero.imageUrl ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-30px_rgb(var(--forest)/0.45)]">
              <Image src={hero.imageUrl} alt="" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            </div>
          ) : (
            <HeroArt />
          )}
        </div>
      </section>

      {/* Ways to practise */}
      {pillars.items.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <SectionHeading eyebrow={pillars.eyebrow} title={pillars.title}>
            {pillars.intro && <p>{pillars.intro}</p>}
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.items.map((p, i) => (
              <Reveal key={`${p.title}-${i}`} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-3xl bg-sage/50 p-8">
                  <span className="font-display text-5xl text-brand/40">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-6 text-2xl font-medium">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/75">{p.text}</p>
                  {p.ctaLabel && p.ctaHref && (
                    <Link href={p.ctaHref} className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-forest hover:gap-2.5">
                      {p.ctaLabel} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Regular classes */}
      {regular.length > 0 && (
        <section className="bg-sand/45 py-16 sm:py-24">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow={sections.classesEyebrow} title={sections.classesTitle} />
              <Link href="/classes" className="btn-ghost">
                All classes
              </Link>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {regular.slice(0, 3).map((p, i) => (
                <ProgrammeCard key={p.slug} programme={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Student stories */}
      {featured.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={sections.testimonialsEyebrow} title={sections.testimonialsTitle} />
            {s.testimonials.length > featured.length && (
              <Link href="/testimonials" className="btn-ghost">
                More stories
              </Link>
            )}
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((t, i) => (
              <TestimonialCard key={t.id} t={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Teacher training */}
      {training.length > 0 && (
        <section className={`${featured.length ? 'bg-sage/35' : ''} py-16 sm:py-24`}>
          <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow={sections.trainingEyebrow} title={sections.trainingTitle}>
                {sections.trainingBody && <p>{sections.trainingBody}</p>}
              </SectionHeading>
              <Reveal delay={120}>
                <Link href="/teacher-training" className="btn-primary mt-8">
                  View training programmes
                </Link>
              </Reveal>
            </div>
            <ul className="divide-y divide-forest/10 border-y border-forest/10">
              {training.map((p, i) => (
                <li key={p.slug}>
                  <Reveal delay={i * 60}>
                    <Link href={`/teacher-training#${p.slug}`} className="group flex items-center justify-between gap-6 py-5">
                      <span>
                        <span className="block font-display text-xl text-forest sm:text-2xl">{p.name}</span>
                        <span className="mt-1 block text-sm text-ink/60">
                          {p.discipline}
                          {p.mode ? ` · ${p.mode}` : ''}
                        </span>
                      </span>
                      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition group-hover:bg-forest group-hover:text-cream">
                        →
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={sections.teamEyebrow} title={sections.teamTitle} />
            <Link href="/team" className="btn-ghost">
              Meet the team
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <TeamCard key={m.id} member={m} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* How to begin */}
      {steps.items.length > 0 && (
        <section className="bg-forest py-16 text-cream sm:py-24">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow !text-cream/60">{steps.eyebrow}</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight text-cream sm:text-[2.6rem]">{steps.title}</h2>
            </Reveal>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.items.map((st, i) => (
                <li key={`${st.title}-${i}`} className="border-t border-cream/20 pt-6">
                  <Reveal delay={i * 90}>
                    <span className="font-display text-sm tracking-widest text-cream/50">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-2xl font-medium text-cream">{st.title}</h3>
                    <p className="mt-3 leading-relaxed text-cream/70">{st.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading eyebrow={sections.faqEyebrow} title={sections.faqTitle} />
            <Reveal>
              <Faq items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </Reveal>
          </div>
        </section>
      )}

      <CtaBand title={cta.title}>{cta.body && <p>{cta.body}</p>}</CtaBand>

      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </>
  );
}
