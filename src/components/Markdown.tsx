import Link from 'next/link';
import type { ReactNode } from 'react';

// Renders the Markdown that staff write in the admin panel's blog editor. Only the
// formatting its toolbar offers is supported: headings, paragraphs, bold, italic,
// links, bulleted/numbered lists, quotes, images and dividers. Output is built from
// React elements (never raw HTML), and only safe link/image addresses are kept.

type Block =
  | { type: 'h'; level: 2 | 3 | 4; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'img'; alt: string; src: string }
  | { type: 'hr' };

const safeHref = (url: string) => (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url) ? url : null);
const safeSrc = (url: string) => (/^https?:\/\//i.test(url) ? url : null);

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join('\n') });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      // A single "#" is the article title's level, so it becomes a section heading.
      blocks.push({ type: 'h', level: Math.min(4, Math.max(2, heading[1].length)) as 2 | 3 | 4, text: heading[2] });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      blocks.push({ type: 'hr' });
      continue;
    }
    const image = /^!\[([^\]]*)\]\(\s*([^)\s]+)\s*\)$/.exec(trimmed);
    if (image) {
      flush();
      const src = safeSrc(image[2]);
      if (src) blocks.push({ type: 'img', alt: image[1], src });
      continue;
    }
    if (trimmed.startsWith('>')) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) quote.push(lines[i++].trim().replace(/^>\s?/, ''));
      i--;
      blocks.push({ type: 'quote', text: quote.join('\n') });
      continue;
    }
    const listItem = (l: string) => /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(l);
    const first = listItem(line);
    if (first) {
      flush();
      const ordered = /\d/.test(first[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = listItem(lines[i]);
        if (m && /\d/.test(m[1]) === ordered) items.push(m[2]);
        else if (lines[i].trim() && items.length && /^\s{2,}/.test(lines[i])) items[items.length - 1] += ` ${lines[i].trim()}`;
        else break;
        i++;
      }
      i--;
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
      continue;
    }
    para.push(trimmed);
  }
  flush();
  return blocks;
}

/** Bold, italic, inline code and links inside a line of text. */
function inline(text: string, key = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|__(.+?)__|\*(?!\s)(.+?)\*|_(?!\s)(.+?)_(?![A-Za-z0-9])|`([^`]+)`|\[([^\]]+)\]\(\s*([^)\s]+)\s*\)|\n/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[1] ?? m[2]) out.push(<strong key={k} className="font-semibold text-forest">{inline(m[1] ?? m[2], k)}</strong>);
    else if (m[3] ?? m[4]) out.push(<em key={k}>{inline(m[3] ?? m[4], k)}</em>);
    else if (m[5]) out.push(<code key={k} className="rounded bg-sand px-1.5 py-0.5 text-[0.9em]">{m[5]}</code>);
    else if (m[6]) {
      const href = safeHref(m[7]);
      const cls = 'font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand';
      if (!href) out.push(inline(m[6], k));
      else if (href.startsWith('/') || href.startsWith('#')) out.push(<Link key={k} href={href} className={cls}>{inline(m[6], k)}</Link>);
      else
        out.push(
          <a key={k} href={href} className={cls} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {inline(m[6], k)}
          </a>,
        );
    } else out.push(<br key={k} />);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-6 text-[1.075rem] leading-[1.8] text-ink/85">
      {parse(source).map((b, i) => {
        switch (b.type) {
          case 'h': {
            const cls = b.level === 2 ? 'pt-4 text-3xl font-medium leading-tight' : b.level === 3 ? 'pt-2 text-2xl font-medium leading-snug' : 'text-xl font-medium';
            const H = `h${b.level}` as 'h2' | 'h3' | 'h4';
            return <H key={i} className={cls}>{inline(b.text, `h${i}`)}</H>;
          }
          case 'p':
            return <p key={i}>{inline(b.text, `p${i}`)}</p>;
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-clay/40 pl-5 font-display text-xl italic leading-relaxed text-forest">
                {inline(b.text, `q${i}`)}
              </blockquote>
            );
          case 'ul':
          case 'ol': {
            const L = b.type;
            return (
              <L key={i} className={`space-y-2 pl-6 ${b.type === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-clay`}>
                {b.items.map((item, j) => (
                  <li key={j} className="pl-1">{inline(item, `l${i}-${j}`)}</li>
                ))}
              </L>
            );
          }
          case 'img':
            return (
              <figure key={i} className="my-8">
                {/* Uploaded photos come in any size, so a plain lazy-loaded image is used. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="w-full rounded-2xl bg-sage" />
                {b.alt && <figcaption className="mt-2 text-center text-sm text-ink/55">{b.alt}</figcaption>}
              </figure>
            );
          case 'hr':
            return <hr key={i} className="mx-auto my-10 w-24 border-forest/20" />;
        }
      })}
    </div>
  );
}
