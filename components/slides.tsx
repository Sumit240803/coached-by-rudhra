import Image from "next/image";
import Link from "next/link";
import {
  faqs,
  media,
  programPillars,
  site,
  transformations,
  whatChanges,
  whoThisIsFor,
  whyPillars,
  whatsappLink,
} from "@/lib/content";
import { Card, LinkButton } from "@/components/ui";
import { CoachBio } from "@/components/sections";

export function MeetSlide() {
  return (
    <Card className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-tile">
        <Image
          src={media.coachPortrait.src}
          width={media.coachPortrait.width}
          height={media.coachPortrait.height}
          alt="Rudhra, founder and head coach of CoachedByRudhra."
          sizes="(min-width: 640px) 36rem, 100vw"
          className="h-auto w-full"
          priority
        />
      </div>

      <div className="mt-6">
        <CoachBio />
      </div>
    </Card>
  );
}

export function WhySlide() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      {whyPillars.map((p) => (
        <Card key={p.title} className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold">
            <span className="mr-2">{p.emoji}</span>
            {p.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
        </Card>
      ))}
    </div>
  );
}

export function ProgramSlide() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {programPillars.map((p) => (
        <Card key={p.title} className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-rust">
            <span className="mr-2">{p.emoji}</span>
            {p.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            {p.body}
          </p>
        </Card>
      ))}
      <Card className="border border-rust/20 p-5 text-center">
        <p className="font-display text-2xl font-bold text-rust">
          From {site.priceFrom} onwards
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Depending on program and duration — discussed in detail during your
          free consultation.
        </p>
      </Card>
    </div>
  );
}

export function WhoSlide() {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <ul className="divide-y divide-rust/10">
        {whoThisIsFor.map((item) => (
          <li key={item} className="flex gap-3 py-4">
            <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-rust" />
            <span className="text-ink-soft">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ChangesSlide() {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <ul className="divide-y divide-rust/10">
        {whatChanges.map((c) => (
          <li key={c.text} className="flex gap-3 py-4">
            <span className="text-lg">{c.emoji}</span>
            <span className="text-ink-soft">{c.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ProofSlide() {
  // Duplicated once so the marquee can loop seamlessly at -50%.
  const track = [...transformations, ...transformations];
  return (
    <div className="w-full">
      <div className="group relative overflow-hidden">
        <div className="flex w-max items-start gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {track.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="w-56 flex-none overflow-hidden rounded-card bg-card shadow-tile"
            >
              <Image
                src={t.src}
                width={t.width}
                height={t.height}
                alt={t.alt}
                sizes="224px"
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center font-display text-xs tracking-widest text-ink-soft">
        Real clients · Touch to pause
      </p>
    </div>
  );
}

export function FaqSlide() {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <ul className="divide-y divide-rust/10">
        {faqs.map((f) => (
          <li key={f.q} className="py-4">
            <p className="font-semibold">{f.q}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CtaSlide() {
  return (
    <Card className="mx-auto w-full max-w-lg text-center">
      <p className="text-ink-soft">
        Spots for 1:1 coaching are limited each month, so every client gets real
        attention.
      </p>
      <div className="mt-6 space-y-3">
        <LinkButton href="/apply">📋 Book Your Free Consultation →</LinkButton>
        <LinkButton
          href={whatsappLink(
            "Hi Rudhra, I'd like to book a free consultation.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          tone="whatsapp"
        >
          💬 Message On WhatsApp
        </LinkButton>
      </div>
      <div className="mt-6 space-y-1.5">
        <Link
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-ink-soft underline transition hover:text-rust"
        >
          {site.handle} on Instagram
        </Link>
        <a
          href={`mailto:${site.supportEmail}`}
          className="block text-sm text-ink-soft transition hover:text-rust"
        >
          Support: {site.supportEmail}
        </a>
      </div>
    </Card>
  );
}
