import { notFound } from 'next/navigation';
import type { LegalKey } from '@/content/defaults';
import { getSite } from '@/lib/content';
import { PageHero } from './ui';

/** Renders a policy page published from the admin panel (404 until it is published). */
export default async function LegalPage({ blockKey }: { blockKey: LegalKey }) {
  const doc = (await getSite()).legal(blockKey);
  if (!doc) notFound();
  return (
    <>
      <PageHero eyebrow={doc.updated ? `Last updated ${doc.updated}` : 'Policy'} title={doc.title}>
        {doc.intro && <p>{doc.intro}</p>}
      </PageHero>
      <article className="container-page max-w-3xl pb-20 sm:pb-28">
        {doc.sections.map((sec, i) => (
          <section key={i} className="border-t border-forest/10 py-8">
            <h2 className="text-2xl font-medium">{sec.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink/80">
              {sec.text.split(/\n\s*\n/).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </>
  );
}
