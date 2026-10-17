import Image from 'next/image';
import Link from 'next/link';
import { formatDate, type BlogPostCard } from '@/lib/content';
import Reveal from './Reveal';

function Meta({ post }: { post: BlogPostCard }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/50">
      {[post.publishedAt && formatDate(post.publishedAt), `${post.readMinutes} min read`].filter(Boolean).join(' · ')}
    </p>
  );
}

function Cover({ post, sizes, priority }: { post: BlogPostCard; sizes: string; priority?: boolean }) {
  return post.coverImageUrl ? (
    <Image
      src={post.coverImageUrl}
      alt={post.coverAlt ?? ''}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition duration-700 group-hover:scale-[1.03]"
    />
  ) : (
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-sage via-sand to-cream">
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-forest/10" />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-cream/60" />
    </div>
  );
}

/** The first, featured article: wide image beside the text. */
export function FeaturedPost({ post }: { post: BlogPostCard }) {
  return (
    <Reveal>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-3xl border border-forest/10 bg-white/70 transition duration-300 hover:shadow-[0_24px_60px_-28px_rgb(var(--forest)/0.45)] md:grid-cols-[1.2fr_1fr]"
      >
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[22rem]">
          <Cover post={post} priority sizes="(max-width: 768px) 100vw, 55vw" />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <Meta post={post} />
          <h2 className="mt-3 text-3xl font-medium leading-tight transition group-hover:text-brand sm:text-4xl">{post.title}</h2>
          <p className="mt-4 leading-relaxed text-ink/75">{post.excerpt}</p>
          {post.authorName && <p className="mt-5 text-sm text-ink/60">By {post.authorName}</p>}
          <span className="mt-6 text-sm font-semibold text-forest">Read the article →</span>
        </div>
      </Link>
    </Reveal>
  );
}

export function BlogCard({ post, index = 0 }: { post: BlogPostCard; index?: number }) {
  return (
    <Reveal delay={Math.min(index, 5) * 70} className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgb(var(--forest)/0.45)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Cover post={post} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <Meta post={post} />
          <h3 className="mt-2 text-xl font-medium leading-snug transition group-hover:text-brand">{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink/70">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
              {post.tags.slice(0, 3).map((t) => (
                <li key={t} className="rounded-full bg-sage px-2.5 py-1 text-xs font-medium text-forest">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </Reveal>
  );
}
