import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-4 text-5xl font-medium sm:text-6xl">Take a breath.</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink/70">This page does not exist, or it has moved. Let us get you back to somewhere calm.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/classes" className="btn-ghost">
            See classes
          </Link>
        </div>
      </div>
    </section>
  );
}
