import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TestimonialCard } from '@/components/People';
import { CtaBand, PageHero } from '@/components/ui';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Student Stories',
  description: 'Students of Moksha Wellness on what their yoga and Pilates practice has meant to them.',
  alternates: { canonical: '/testimonials' },
};

export default async function TestimonialsPage() {
  const s = await getSite();
  if (!s.testimonials.length) notFound();
  const page = s.block('testimonials.page');
  return (
    <>
      <PageHero eyebrow={page.heroEyebrow} title={page.heroTitle}>
        {page.heroBody && <p>{page.heroBody}</p>}
      </PageHero>
      <section className="container-page pb-16 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {s.testimonials.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}
        </div>
      </section>
      <CtaBand title="Begin your own story.">
        <p>Send an enquiry and we will help you find the right class, format and plan.</p>
      </CtaBand>
    </>
  );
}
