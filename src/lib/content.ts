import { cache } from 'react';
import { draftMode } from 'next/headers';
import { DEFAULT_BLOCKS, DEFAULT_FAQS, type Blocks, type LegalBlock, type LegalKey } from '@/content/defaults';
import { regularClasses, teacherTraining, type Mode, type Programme } from '@/content/programmes';

// Everything the website shows comes from the admin panel's public content API,
// cached and tagged "cms". The admin API calls /api/revalidate after a publish,
// so changes appear within seconds; otherwise the cache refreshes every 5 minutes.
// If the API cannot be reached, the built-in copy is used so pages never break.

export const CMS_TAG = 'cms';
const REVALIDATE_SECONDS = 300;

export interface OnlinePlan {
  id: string;
  title: string;
  pricePaise: string;
  durationType: string;
  durationValue: number | null;
}
export interface SiteProgramme extends Programme {
  id: string | null;
  category: 'REGULAR' | 'TEACHER_TRAINING';
  imageUrl: string | null;
  onlinePlans: OnlinePlan[];
}
export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  title: string;
  shortBio: string;
  bio: string | null;
  photoUrl: string | null;
  specialization: string | null;
  experience: string | null;
  qualifications: string | null;
  socialLinks: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'website', string>> | null;
}
export interface Testimonial {
  id: string;
  studentName: string;
  photoUrl: string | null;
  videoSource: 'NONE' | 'YOUTUBE' | 'VIMEO' | 'UPLOAD';
  videoUrl: string | null;
  posterUrl: string | null;
  quote: string;
  courseName: string | null;
  isFeatured: boolean;
}
export interface Faq {
  id?: string;
  question: string;
  answer: string;
  page?: string;
}
export interface Announcement {
  id: string;
  message: string;
  linkLabel: string | null;
  linkUrl: string | null;
}
export interface GalleryItem {
  id: string;
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  posterUrl: string | null;
  caption: string | null;
  alt: string | null;
  album: string | null;
}

export interface BlogPostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverAlt: string | null;
  authorName: string | null;
  tags: string[];
  isFeatured: boolean;
  publishedAt: string | null;
  readMinutes: number;
}
export interface BlogPost extends BlogPostCard {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

interface SitePayload {
  preview: boolean;
  /** Visible blog articles (older API versions do not send this). */
  blogCount?: number;
  taxPercent: number;
  /** An Anthropic (Claude) key is configured on the API (older API versions do not send this). */
  chatbotAvailable?: boolean;
  blocks: Record<string, Record<string, unknown> | null>;
  team: TeamMember[];
  testimonials: Testimonial[];
  faqs: Faq[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  programmes: {
    id: string;
    slug: string;
    name: string;
    category: 'REGULAR' | 'TEACHER_TRAINING';
    discipline: string | null;
    mode: Mode | null;
    summary: string | null;
    forWhom: string | null;
    imageUrl: string | null;
    onlinePlans: OnlinePlan[];
  }[];
}

export interface Site {
  live: boolean;
  preview: boolean;
  taxPercent: number;
  /** The AI chatbot can run on the API; the admin also switches it on/off in "AI chatbot". */
  chatbotAvailable: boolean;
  block: <K extends keyof Blocks>(key: K) => Blocks[K];
  legal: (key: LegalKey) => LegalBlock | null;
  team: TeamMember[];
  testimonials: Testimonial[];
  faqs: (page: string) => Faq[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  programmes: SiteProgramme[];
  /** Number of published blog articles. */
  blogCount: number;
}

const fallbackProgrammes = (): SiteProgramme[] => [
  ...regularClasses.map((p) => ({ ...p, id: null, category: 'REGULAR' as const, imageUrl: null, onlinePlans: [] })),
  ...teacherTraining.map((p) => ({ ...p, id: null, category: 'TEACHER_TRAINING' as const, imageUrl: null, onlinePlans: [] })),
];

/** GET a public content endpoint; null when the API is not configured, unreachable or answers an error. */
async function fetchPublic<T>(path: string, preview: boolean, quiet404 = false): Promise<T | null> {
  const base = process.env.ADMIN_API_URL?.replace(/\/+$/, '');
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/public${path}${preview ? '?preview=1' : ''}`, {
      headers: preview ? { 'x-service-key': process.env.WEBSITE_SERVICE_KEY ?? '' } : {},
      ...(preview ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] } }),
      signal: AbortSignal.timeout(preview ? 30_000 : 12_000),
    });
    if (!res.ok) {
      if (!(quiet404 && res.status === 404)) console.error(`[content] admin API answered ${res.status} for ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error('[content] admin API unreachable — using built-in content:', (err as Error).name);
    return null;
  }
}

const fetchSite = (preview: boolean) => fetchPublic<SitePayload>('/site', preview);

async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request (build-time metadata, sitemap): no draft mode.
    return false;
  }
}

/**
 * A published section replaces the built-in copy completely (so an admin can also clear a
 * field, e.g. remove a phone number). Fields the section does not have yet — added to the
 * website after it was last saved — keep their built-in text.
 */
function merge<T extends object>(defaults: T, data: Record<string, unknown> | null | undefined): T {
  if (!data) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [k, d] of Object.entries(defaults)) {
    const v = data[k];
    if (Array.isArray(d) ? Array.isArray(v) : typeof v === typeof d) out[k] = v;
  }
  return out as T;
}

/** All website content for this request (deduplicated across components). */
export const getSite = cache(async (): Promise<Site> => {
  const data = await fetchSite(await isPreview());
  const programmes: SiteProgramme[] = data
    ? data.programmes.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        discipline: (p.discipline ?? 'Yoga') as Programme['discipline'],
        mode: p.mode ?? undefined,
        summary: p.summary ?? '',
        forWhom: p.forWhom ?? '',
        imageUrl: p.imageUrl,
        onlinePlans: p.onlinePlans,
      }))
    : fallbackProgrammes();

  return {
    live: !!data,
    preview: !!data?.preview,
    taxPercent: data?.taxPercent ?? 0,
    chatbotAvailable: !!data?.chatbotAvailable,
    block: (key) => merge(DEFAULT_BLOCKS[key], data?.blocks?.[key]),
    legal: (key) => {
      const b = data?.blocks?.[key] as LegalBlock | null | undefined;
      return b && b.title && b.sections?.length ? b : null;
    },
    team: data?.team ?? [],
    testimonials: data?.testimonials ?? [],
    faqs: (page) => (data ? data.faqs.filter((f) => (f.page ?? 'HOME') === page) : page === 'HOME' ? DEFAULT_FAQS : []),
    announcements: data?.announcements ?? [],
    gallery: data?.gallery ?? [],
    programmes: programmes.length ? programmes : fallbackProgrammes(),
    blogCount: data?.blogCount ?? 0,
  };
});

/** Published blog articles, featured first, then newest first (no article bodies). */
export const getBlogPosts = cache(async (): Promise<BlogPostCard[]> => {
  const data = await fetchPublic<{ posts: BlogPostCard[] }>('/blog', await isPreview());
  return data?.posts ?? [];
});

/** One blog article and up to three to read next, or null if there is no such (visible) article. */
export const getBlogPost = cache(async (slug: string): Promise<{ post: BlogPost; related: BlogPostCard[] } | null> => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  return fetchPublic<{ post: BlogPost; related: BlogPostCard[] }>(`/blog/${slug}`, await isPreview(), true);
});

/** e.g. "17 October 2026". */
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** wa.me link with a pre-filled greeting, or null when no WhatsApp number is configured. */
export function whatsappHref(number: string, message = 'Hello Moksha Wellness, I would like to know more about your classes.') {
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}

/** WhatsApp number for display, e.g. "919392842740" → "+91 93928 42740". */
export function formatWhatsApp(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return digits ? `+${digits}` : '';
}

export const rupees =(paise: string | number) =>
  `₹${(Number(paise) / 100).toLocaleString('en-IN', { maximumFractionDigits: Number(paise) % 100 ? 2 : 0 })}`;
