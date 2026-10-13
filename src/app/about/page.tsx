import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import { CtaBand, PageHero, SectionHeading } from '@/components/ui';
import { FullLogo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'About',
  description: 'What Moksha Wellness stands for: steady practice, careful teaching and respect for every body.',
  alternates: { canonical: '/about' },
};

const values = [
  { title: 'Practice over performance', text: 'There is nothing to win here. We care about how a posture feels and what it teaches you, not how it looks.' },
  { title: 'Your limits are respected', text: 'You work within your own ability. Tell your teacher what is going on in your body, and ask for a modification whenever you need one.' },
  { title: 'Clear, careful teaching', text: 'Simple instruction, a steady pace and room to ask questions, in the studio and online alike.' },
  { title: 'A considerate space', text: 'Arrive on time, keep phones silent, and treat teachers and fellow students with respect. It is what lets everyone settle.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Moksha Wellness" title="A place to practise, patiently">
        <p>
          Moksha means freedom. For us that is not a distant idea. It is the ease that comes from a body that moves
          well and a mind that has learned to be quiet for a while.
        </p>
      </PageHero>

      <section className="container-page grid items-center gap-12 pb-16 sm:pb-24 lg:grid-cols-2">
        <Reveal>
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sage to-sand">
            <FullLogo className="h-auto w-[46%] max-w-[15rem]" />
          </div>
        </Reveal>
        <div>
          <SectionHeading eyebrow="What we offer" title="Yoga and Pilates, taught with care">
            <p>
              We teach regular yoga and Pilates classes in the studio and live online, and run teacher training
              programmes for practitioners who want to go further.
            </p>
            <p className="mt-4">
              Before you begin, we ask about your health and experience so that your teacher can guide you
              appropriately. From there, the work is simple: show up, breathe, and practise.
            </p>
          </SectionHeading>
        </div>
      </section>

      <section className="bg-sand/45 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="How we practise" title="What you can expect from us, and what we ask of you" />
          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 90}>
                <div className="flex gap-5">
                  <span className="font-display text-3xl text-brand/50">0{i + 1}</span>
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

      <CtaBand title="Come and practise with us.">
        <p>Send an enquiry and we will help you choose a class, a format and a plan.</p>
      </CtaBand>
    </>
  );
}
