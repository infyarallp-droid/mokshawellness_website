import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/BlogCard';
import Markdown from '@/components/Markdown';
import { CtaBand } from '@/components/ui';
import { site } from '@/content/site';
import { formatDate, getBlogPost } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBlogPost((await params).slug);
  if (!data) return { title: 'Article not found' };
  const { post } = data;
  const description = post.seoDescription || post.excerpt;
  return {
    title: post.seoTitle || post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description,
      url: `/blog/${post.slug}`,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      modifiedTime: post.updatedAt,
      ...(post.authorName ? { authors: [post.authorName] } : {}),
      ...(post.tags.length ? { tags: post.tags } : {}),
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl, alt: post.coverAlt ?? '' }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const data = await getBlogPost((await params).slug);
  if (!data) notFound();
  const { post, related } = data;

  // Structured data so search engines can show the article with its date and image.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(post.coverImageUrl ? { image: [post.coverImageUrl] } : {}),
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}${site.logo.src}` } },
    ...(post.tags.length ? { keywords: post.tags.join(', ') } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <article>
        <header className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-sage/70 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-sand blur-3xl" />
          <div className="container-page relative max-w-3xl pb-10 pt-12 sm:pt-20">
            <Link href="/blog" className="text-sm font-semibold text-forest hover:text-brand">
              ← All articles
            </Link>
            {post.tags.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <li key={t}>
                    <Link href={`/blog?tag=${encodeURIComponent(t)}`} className="eyebrow hover:text-forest">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <h1 className="mt-4 text-4xl font-medium leading-[1.1] sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/75">{post.excerpt}</p>
            <p className="mt-6 text-sm text-ink/60">
              {[post.authorName && `By ${post.authorName}`, post.publishedAt && formatDate(post.publishedAt), `${post.readMinutes} min read`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </header>
        {post.coverImageUrl && (
          <div className="container-page max-w-5xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-sage">
              <Image src={post.coverImageUrl} alt={post.coverAlt ?? ''} fill priority sizes="(max-width: 1024px) 100vw, 64rem" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container-page max-w-3xl py-12 sm:py-16">
          <Markdown source={post.body} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-forest/10 bg-white/40">
          <div className="container-page py-14 sm:py-20">
            <h2 className="text-3xl font-medium">Keep reading</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="Practise with us.">
        <p>Send an enquiry and we will help you find the right class, format and plan.</p>
      </CtaBand>
    </>
  );
}
