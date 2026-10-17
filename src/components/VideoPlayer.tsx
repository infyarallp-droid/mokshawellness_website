'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Source = 'YOUTUBE' | 'VIMEO' | 'UPLOAD';
const PLAY_EVENT = 'mw-video-play';

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/);
  return m?.[1] ?? null;
}
const vimeoId = (url: string) => url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ?? null;

/**
 * Click-to-play video. Nothing from YouTube/Vimeo loads until the visitor presses
 * play (fast pages, no third-party tracking), nothing autoplays on its own, and
 * starting one video stops any other playing on the page.
 */
export default function VideoPlayer({ id, source, url, poster, title }: { id: string; source: Source; url: string; poster?: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const stop = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setPlaying(false);
    };
    window.addEventListener(PLAY_EVENT, stop);
    return () => window.removeEventListener(PLAY_EVENT, stop);
  }, [id]);

  const play = () => {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
    setPlaying(true);
  };

  const yt = source === 'YOUTUBE' ? youtubeId(url) : null;
  const vm = source === 'VIMEO' ? vimeoId(url) : null;
  const thumb = poster || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null);

  if (playing) {
    if (source === 'UPLOAD') {
      return (
        <video
          src={url}
          poster={poster ?? undefined}
          controls
          autoPlay
          playsInline
          className="aspect-video w-full rounded-2xl bg-black"
          onPlay={() => window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }))}
        />
      );
    }
    const src = yt
      ? `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`
      : vm
        ? `https://player.vimeo.com/video/${vm}?autoplay=1&dnt=1`
        : null;
    if (!src) return null;
    return (
      <iframe
        src={src}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        className="aspect-video w-full rounded-2xl bg-black"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={play}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-forest/90 text-left focus-visible:ring-2 focus-visible:ring-brand"
      aria-label={`Play video: ${title}`}
    >
      {thumb ? (
        <Image src={thumb} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-forest to-brand" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/95 text-forest shadow-lg transition group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7L8 5Z" />
        </svg>
      </span>
    </button>
  );
}
