import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TeamCard } from '@/components/People';
import { CtaBand, PageHero } from '@/components/ui';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the teachers at Moksha Wellness — yoga and Pilates in the studio and online.',
  alternates: { canonical: '/team' },
};

export default async function TeamPage() {
  const s = await getSite();
  if (!s.team.length) notFound();
  const page = s.block('team.page');
  return (
    <>
      <PageHero eyebrow={page.heroEyebrow} title={page.heroTitle}>
        {page.heroBody && <p>{page.heroBody}</p>}
      </PageHero>
      <section className="container-page pb-16 sm:pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.team.map((m, i) => (
            <TeamCard key={m.id} member={m} index={i} detailed />
          ))}
        </div>
      </section>
      <CtaBand title="Practise with our teachers.">
        <p>Tell us what you would like to practise and we will suggest the class and teacher that fit.</p>
      </CtaBand>
    </>
  );
}
