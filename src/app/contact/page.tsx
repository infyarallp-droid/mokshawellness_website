import type { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import { PageHero } from '@/components/ui';
import { allProgrammes } from '@/content/programmes';
import { site, whatsappLink } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact & Enquiries',
  description: 'Ask Moksha Wellness about yoga and Pilates classes, teacher training, timings and fees.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ interest?: string | string[] }> }) {
  const { interest } = await searchParams;
  const slug = typeof interest === 'string' && allProgrammes.some((p) => p.slug === interest) ? interest : '';
  const { contact } = site;
  const wa = whatsappLink();
  const details = [
    contact.phone && { label: 'Call', value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}` },
    wa && { label: 'WhatsApp', value: 'Message us on WhatsApp', href: wa },
    contact.email && { label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <>
      <PageHero eyebrow="Contact" title="Let us find the right class for you">
        <p>Tell us what you would like to practise. We will reply with the class that fits, its timings and the plan options.</p>
      </PageHero>

      <section id="enquire" className="container-page grid scroll-mt-24 gap-12 pb-20 sm:pb-28 lg:grid-cols-[1.25fr_0.75fr]">
        <EnquiryForm key={slug} initialInterest={slug} />

        <aside className="space-y-8 lg:pt-4">
          <div>
            <h2 className="text-2xl font-medium">What happens next</h2>
            <ol className="mt-4 space-y-3 text-ink/75">
              <li>
                <span className="font-semibold text-forest">1.</span> Your enquiry reaches the studio team straight away.
              </li>
              <li>
                <span className="font-semibold text-forest">2.</span> We reply on the mobile number you share.
              </li>
              <li>
                <span className="font-semibold text-forest">3.</span> You choose a class and plan, and begin.
              </li>
            </ol>
          </div>

          {details.length > 0 && (
            <div>
              <h2 className="text-2xl font-medium">Reach us directly</h2>
              <ul className="mt-4 space-y-3">
                {details.map((d) => (
                  <li key={d.label}>
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">{d.label}</span>
                    <a href={d.href} className="text-lg text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest">
                      {d.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(contact.address.length > 0 || contact.mapsUrl) && (
            <div>
              <h2 className="text-2xl font-medium">Visit the studio</h2>
              {contact.address.length > 0 && (
                <address className="mt-4 not-italic leading-relaxed text-ink/75">
                  {contact.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              )}
              {contact.mapsUrl && (
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest">
                  Find us on Google — directions, photos and reviews
                </a>
              )}
            </div>
          )}

          {contact.hours.length > 0 && (
            <div>
              <h2 className="text-2xl font-medium">Hours</h2>
              <dl className="mt-4 space-y-2 text-ink/75">
                {contact.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6 border-b border-forest/10 pb-2">
                    <dt>{h.days}</dt>
                    <dd className="font-medium text-forest">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
