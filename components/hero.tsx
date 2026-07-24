import Link from "next/link";
import { hero, site } from "@/lib/content";
import { Button, InstagramIcon } from "@/components/ui";

export function Hero({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <Link
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${hero.badge} on Instagram`}
        className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-display text-xs tracking-widest shadow-tile transition hover:text-rust focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
      >
        <InstagramIcon className="h-5 w-5 text-rust" />
        {hero.badge}
      </Link>

      <h1 className="mt-8 font-display text-[1.9rem] leading-[0.95] font-bold text-balance sm:text-5xl md:text-6xl">
        {hero.headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        <span className="block text-rust">{hero.headlineAccent}</span>
      </h1>

      <p className="mx-auto mt-5 max-w-md text-ink-soft">{hero.sub}</p>

      <div className="mx-auto mt-8 max-w-sm">
        <Button onClick={onStart}>{hero.cta} →</Button>
      </div>
      <p className="mt-3 text-sm text-ink-faint">{hero.microcopy}</p>

      <button
        onClick={onSkip}
        className="mt-10 text-sm text-ink-soft underline transition hover:text-rust"
      >
        {hero.skip}
      </button>
    </div>
  );
}
