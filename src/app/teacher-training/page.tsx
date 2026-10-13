import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import { CtaBand, PageHero, ProgrammeCard, SectionHeading } from '@/components/ui';
import { teacherTraining } from '@/content/programmes';

export const metadata: Metadata = {
  title: 'Teacher Training',
  description:
    'Teacher training at Moksha Wellness: 200-hour and 300-hour yoga teacher training, Mat Pilates Level 1, Bala Yoga and Aerial Yoga training.',
  alternates: { canonical: '/teacher-training' },
};

const expectations = [
  { title: 'Your own practice first', text: 'Teaching grows out of practice. Each programme deepens what you do on the mat before asking you to guide anyone else.' },
  { title: 'Learning to teach', text: 'How to plan a class, give clear instruction, and adapt a practice to the person in front of you.' },
  { title: 'Safety and responsibility', text: 'Working within limits, your own and those of your students, and knowing when to modify or stop.' },
];

export default function TeacherTrainingPage() {
  return (
    <>
      <PageHero eyebrow="Teacher training" title="For those who want to take the practice further">
        <p>
          Five programmes across yoga and Pilates. Dates, duration, format and fees are shared when you enquire, so you
          always get the current intake.
        </p>
      </PageHero>

      <section className="container-page pb-16 sm:pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teacherTraining.map((p, i) => (
            <ProgrammeCard key={p.slug} programme={p} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-sage/45 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="What a training asks of you" title="More than a certificate" />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {expectations.map((e, i) => (
              <Reveal key={e.title} delay={i * 90}>
                <div className="border-t border-forest/20 pt-6">
                  <h3 className="text-2xl font-medium">{e.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/75">{e.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Thinking about a training?">
        <p>Tell us which programme interests you and where you are in your practice. We will send the details of the next intake.</p>
      </CtaBand>
    </>
  );
}
