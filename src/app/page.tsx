import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { CtaBand, Faq, HeroArt, ProgrammeCard, SectionHeading } from '@/components/ui';
import { regularClasses, teacherTraining } from '@/content/programmes';
import { site } from '@/content/site';

const pillars = [
  {
    title: 'In the studio',
    text: 'Practise in person, in a room set aside for it — with a teacher who can see how you move and guide you through it.',
    href: '/classes',
    cta: 'Studio classes',
  },
  {
    title: 'Online, live',
    text: 'Join yoga and Pilates classes from home. The same teaching and the same group, wherever you happen to be.',
    href: '/classes',
    cta: 'Online classes',
  },
  {
    title: 'Teacher training',
    text: 'Structured programmes in yoga, mat Pilates, children’s yoga and aerial yoga for those who want to go deeper.',
    href: '/teacher-training',
    cta: 'Training programmes',
  },
];

const steps = [
  { n: '01', title: 'Tell us about you', text: 'Send a short enquiry — what you would like to practise, and whether you prefer the studio or online.' },
  { n: '02', title: 'We suggest a class', text: 'We reply with the class that fits, its timings and the plan options, and answer your questions.' },
  { n: '03', title: 'Begin your practice', text: 'Complete a short health declaration and consent form, choose your plan, and step onto the mat.' },
];

const faqs = [
  {
    q: 'How do I find out about fees and timings?',
    a: 'Fees depend on the class and the plan you choose, and timings vary by batch. Send us an enquiry and we will share the current options for the class you are interested in.',
  },
  {
    q: 'Can I practise online instead of coming to the studio?',
    a: 'Yes. Regular yoga, advanced yoga and Pilates classes run online, and Mat Pilates Level 1 Teacher Training is offered both in the studio and online. Each class page shows how it is taught.',
  },
  {
    q: 'I have an injury or a health condition. Can I still join?',
    a: 'Tell us when you enquire. Every student completes a health declaration before starting, so your teacher knows what to adapt. If you are unsure whether a practice is right for you, please check with your doctor first.',
  },
  {
    q: 'I am not sure which class is right for me.',
    a: 'Choose “Not sure yet — help me choose” on the enquiry form and tell us a little about your experience. We will suggest where to start.',
  },
  {
    q: 'What do I need before my first class?',
    a: 'We will tell you exactly what to bring or set up when we confirm your class. For online classes you will need a quiet space, a mat and a stable connection.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-sand blur-3xl" />
        <div aria-hidden="true" className="absolute -right-40 top-40 h-[26rem] w-[26rem] rounded-full bg-sage/80 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
          <div>
            <p className="eyebrow">{site.name} · {site.tagline}</p>
            <h1 className="mt-5 text-[2.9rem] font-medium leading-[1.02] sm:text-7xl">
              Come home to <em className="font-normal italic text-brand">your breath.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl">
              Yoga and Pilates for steadier bodies and quieter minds — in the studio, live online, and through teacher
              training for those ready to share the practice.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact#enquire" className="btn-primary">
                Start with an enquiry
              </Link>
              <Link href="/classes" className="btn-ghost">
                Explore classes
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-forest/10 pt-7">
              {[
                [String(regularClasses.length), 'regular classes'],
                [String(teacherTraining.length), 'training programmes'],
                ['2', 'ways to practise: studio & online'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-4xl text-forest">{value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-ink/60">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Three ways to practise */}
      <section className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="How we teach" title="Three ways to practise with us">
          <p>Whether you want a mat beside other people, a class in your living room, or the training to teach — there is a place to begin.</p>
        </SectionHeading>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="h-full">
              <div className="flex h-full flex-col rounded-3xl bg-sage/50 p-8">
                <span className="font-display text-5xl text-brand/40">0{i + 1}</span>
                <h3 className="mt-6 text-2xl font-medium">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/75">{p.text}</p>
                <Link href={p.href} className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-forest hover:gap-2.5">
                  {p.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Regular classes */}
      <section className="bg-sand/45 py-16 sm:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Regular classes" title="A practice you can keep coming back to" />
            <Link href="/classes" className="btn-ghost">
              All classes
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {regularClasses.slice(0, 3).map((p, i) => (
              <ProgrammeCard key={p.slug} programme={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Teacher training */}
      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Teacher training" title="Ready to go deeper — or to teach?">
              <p>
                Our training programmes are for practitioners who want more than a weekly class: a fuller understanding of the
                practice, and the skill to guide others through it.
              </p>
            </SectionHeading>
            <Reveal delay={120}>
              <Link href="/teacher-training" className="btn-primary mt-8">
                View training programmes
              </Link>
            </Reveal>
          </div>
          <ul className="divide-y divide-forest/10 border-y border-forest/10">
            {teacherTraining.map((p, i) => (
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

      {/* How to begin */}
      <section className="bg-forest py-16 text-cream sm:py-24">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow !text-cream/60">Getting started</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight text-cream sm:text-[2.6rem]">Three simple steps to your first class</h2>
          </Reveal>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.n} className="border-t border-cream/20 pt-6">
                <Reveal delay={i * 90}>
                  <span className="font-display text-sm tracking-widest text-cream/50">{s.n}</span>
                  <h3 className="mt-3 text-2xl font-medium text-cream">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-cream/70">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow="Questions" title="Good to know before you begin" />
          <Reveal>
            <Faq items={faqs} />
          </Reveal>
        </div>
      </section>

      <CtaBand title="Your mat is waiting.">
        <p>Tell us what you are looking for and we will help you find the right class, format and plan.</p>
      </CtaBand>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
    </>
  );
}
