import Image from 'next/image';
import type { TeamMember, Testimonial } from '@/lib/content';
import Reveal from './Reveal';
import VideoPlayer from './VideoPlayer';

const SOCIAL_LABEL: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn', website: 'Website' };

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return <span className="grid h-full w-full place-items-center bg-gradient-to-br from-sage to-sand font-display text-4xl text-forest/60">{initials}</span>;
}

export function TeamCard({ member, index = 0, detailed = false }: { member: TeamMember; index?: number; detailed?: boolean }) {
  const socials = Object.entries(member.socialLinks ?? {}).filter(([, v]) => v);
  return (
    <Reveal delay={Math.min(index, 5) * 70} className="h-full">
      <article id={member.slug} className="group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgb(var(--forest)/0.45)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-sage">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={`Portrait of ${member.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <Initials name={member.name} />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-2xl font-medium">{member.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay">{member.title}</p>
          <p className="mt-3 leading-relaxed text-ink/75">{member.shortBio}</p>
          {(member.specialization || member.experience || member.qualifications) && (
            <dl className="mt-4 space-y-1.5 text-sm">
              {member.specialization && <Row label="Specialises in" value={member.specialization} />}
              {member.experience && <Row label="Experience" value={member.experience} />}
              {member.qualifications && <Row label="Qualifications" value={member.qualifications} />}
            </dl>
          )}
          {detailed && member.bio && (
            <details className="group/bio mt-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-forest [&::-webkit-details-marker]:hidden">
                <span className="group-open/bio:hidden">Read full biography →</span>
                <span className="hidden group-open/bio:inline">Hide biography</span>
              </summary>
              <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink/75">
                {member.bio.split(/\n\s*\n/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          )}
          {socials.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-3 pt-5 text-sm">
              {socials.map(([k, href]) => (
                <li key={k}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest">
                    {SOCIAL_LABEL[k] ?? k}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </Reveal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink/50">{label}:</dt>
      <dd className="text-ink/80">{value}</dd>
    </div>
  );
}

export function TestimonialCard({ t, index = 0 }: { t: Testimonial; index?: number }) {
  const hasVideo = t.videoSource !== 'NONE' && !!t.videoUrl;
  return (
    <Reveal delay={Math.min(index, 5) * 70} className="h-full">
      <figure className="flex h-full flex-col rounded-3xl border border-forest/10 bg-white/70 p-4 sm:p-5">
        {hasVideo && (
          <VideoPlayer id={t.id} source={t.videoSource as 'YOUTUBE' | 'VIMEO' | 'UPLOAD'} url={t.videoUrl!} poster={t.posterUrl} title={`${t.studentName} on practising at Moksha Wellness`} />
        )}
        <blockquote className={`px-2 font-display text-lg leading-relaxed text-forest ${hasVideo ? 'mt-5' : 'mt-2'}`}>
          <span aria-hidden="true" className="mr-1 text-3xl leading-none text-bindu/70">
            “
          </span>
          {t.quote}
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-3 px-2 pt-5">
          {t.photoUrl && (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sage">
              <Image src={t.photoUrl} alt="" fill sizes="44px" className="object-cover" />
            </span>
          )}
          <span>
            <span className="block font-semibold text-ink">{t.studentName}</span>
            {t.courseName && <span className="block text-sm text-ink/60">{t.courseName}</span>}
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}
