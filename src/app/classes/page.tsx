import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import { CtaBand, Faq, PageHero, ProgrammeCard, SectionHeading } from '@/components/ui';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Yoga & Pilates Classes',
  description: 'Regular yoga and Pilates classes at Moksha Wellness — in the studio and live online.',
  alternates: { canonical: '/classes' },
};

export default async function ClassesPage() {
  const s = await getSite();
  const c = s.block('classes.page');
  const regular = s.programmes.filter((p) => p.category === 'REGULAR');
  const online = regular.filter((p) => p.mode === 'Online');
  const studio = regular.filter((p) => p.mode !== 'Online');
  const faqs = s.faqs('CLASSES');
  return (
    <>
      <PageHero eyebrow={c.heroEyebrow} title={c.heroTitle}>
        {c.heroBody && <p>{c.heroBody}</p>}
      </PageHero>

      {online.length > 0 && (
        <section className="container-page pb-16 sm:pb-20">
          <SectionHeading eyebrow={c.onlineEyebrow} title={c.onlineTitle} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {online.map((p, i) => (
              <ProgrammeCard key={p.slug} programme={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {studio.length > 0 && (
        <section className="bg-sand/45 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading eyebrow={c.studioEyebrow} title={c.studioTitle} />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {studio.map((p, i) => (
                <ProgrammeCard key={p.slug} programme={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <Reveal>
            <Faq items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
          </Reveal>
        </section>
      )}

      <CtaBand title={c.ctaTitle}>{c.ctaBody && <p>{c.ctaBody}</p>}</CtaBand>
    </>
  );
}
