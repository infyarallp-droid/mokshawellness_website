import type { Metadata } from 'next';
import { CtaBand, PageHero, ProgrammeCard, SectionHeading } from '@/components/ui';
import { regularClasses } from '@/content/programmes';

export const metadata: Metadata = {
  title: 'Yoga & Pilates Classes',
  description: 'Regular yoga and Pilates classes at Moksha Wellness — in the studio and live online.',
  alternates: { canonical: '/classes' },
};

export default function ClassesPage() {
  const studio = regularClasses.filter((p) => p.mode !== 'Online');
  const online = regularClasses.filter((p) => p.mode === 'Online');
  return (
    <>
      <PageHero eyebrow="Regular classes" title="Yoga and Pilates, week after week">
        <p>
          A regular practice does more than an occasional one. Choose a class in the studio or join live online — and
          ask us for the current timings and plans.
        </p>
      </PageHero>

      <section className="container-page pb-16 sm:pb-20">
        <SectionHeading eyebrow="Live online" title="Practise from wherever you are" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {online.map((p, i) => (
            <ProgrammeCard key={p.slug} programme={p} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-sand/45 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="In person" title="Classes at the studio" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studio.map((p, i) => (
              <ProgrammeCard key={p.slug} programme={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure where to start?">
        <p>Tell us about your experience and what you are hoping for. We will suggest a class that fits.</p>
      </CtaBand>
    </>
  );
}
