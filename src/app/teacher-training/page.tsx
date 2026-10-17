import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import { CtaBand, Faq, PageHero, ProgrammeCard, SectionHeading } from '@/components/ui';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Teacher Training',
  description:
    'Teacher training at Moksha Wellness: 200-hour and 300-hour yoga teacher training, Mat Pilates Level 1, Bala Yoga and Aerial Yoga training.',
  alternates: { canonical: '/teacher-training' },
};

export default async function TeacherTrainingPage() {
  const s = await getSite();
  const t = s.block('training.page');
  const training = s.programmes.filter((p) => p.category === 'TEACHER_TRAINING');
  const faqs = s.faqs('TRAINING');
  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle}>
        {t.heroBody && <p>{t.heroBody}</p>}
      </PageHero>

      <section className="container-page pb-16 sm:pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {training.map((p, i) => (
            <ProgrammeCard key={p.slug} programme={p} index={i} />
          ))}
        </div>
      </section>

      {t.expectations.length > 0 && (
        <section className="bg-sage/45 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading eyebrow={t.expectEyebrow} title={t.expectTitle} />
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {t.expectations.map((e, i) => (
                <Reveal key={`${e.title}-${i}`} delay={i * 90}>
                  <div className="border-t border-forest/20 pt-6">
                    <h3 className="text-2xl font-medium">{e.title}</h3>
                    <p className="mt-3 leading-relaxed text-ink/75">{e.text}</p>
                  </div>
                </Reveal>
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

      <CtaBand title={t.ctaTitle}>{t.ctaBody && <p>{t.ctaBody}</p>}</CtaBand>
    </>
  );
}
