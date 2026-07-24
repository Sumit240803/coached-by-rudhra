"use client";

import { useEffect, useState } from "react";
import { deckSlides } from "@/lib/content";
import { Display, Eyebrow } from "@/components/ui";
import {
  ChangesSlide,
  CtaSlide,
  FaqSlide,
  MeetSlide,
  ProgramSlide,
  ProofSlide,
  WhoSlide,
  WhySlide,
} from "@/components/slides";

const bodies: Record<string, React.ComponentType> = {
  meet: MeetSlide,
  why: WhySlide,
  program: ProgramSlide,
  who: WhoSlide,
  changes: ChangesSlide,
  proof: ProofSlide,
  faq: FaqSlide,
  cta: CtaSlide,
};

export function Deck({ onExit }: { onExit: () => void }) {
  const [index, setIndex] = useState(0);

  // Each slide is its own screen, so it must start at its own heading rather
  // than inheriting the scroll position of the slide before it.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const slide = deckSlides[index];
  const Body = bodies[slide.id];
  const isLast = index === deckSlides.length - 1;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 px-4 pt-12 pb-32 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{slide.eyebrow}</Eyebrow>
          <div className="mt-3">
            <Display lead={slide.title} accent={slide.titleAccent} />
          </div>
          {slide.sub && (
            <p className="mx-auto mt-4 max-w-xl font-semibold text-ink-soft">
              {slide.sub}
            </p>
          )}
        </div>

        <div className="mt-8">
          <Body />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rust/10 bg-cream/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button
            onClick={() => (index === 0 ? onExit() : setIndex((i) => i - 1))}
            className="rounded-tile bg-card px-4 py-2.5 font-display text-sm tracking-widest shadow-tile transition hover:text-rust"
          >
            ← Back
          </button>

          <span className="font-display text-xs tracking-widest text-ink-soft">
            {index + 1} of {deckSlides.length}
          </span>

          {isLast ? (
            <span className="w-24" />
          ) : (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-tile bg-rust px-5 py-2.5 font-display text-sm tracking-widest text-white shadow-cta transition hover:bg-rust-dark"
            >
              {slide.next} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
