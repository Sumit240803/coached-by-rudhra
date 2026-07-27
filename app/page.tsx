"use client";

import { useState } from "react";
import { Background } from "@/components/background";
import { Deck } from "@/components/deck";
import { Hero } from "@/components/hero";
import { Quiz } from "@/components/quiz";
import { Result } from "@/components/result";
import { SiteFooter } from "@/components/site-footer";
import { hero } from "@/lib/content";
import type { Answers } from "@/lib/assessment";

type Stage = "hero" | "quiz" | "result" | "deck";

export default function Home() {
  const [stage, setStage] = useState<Stage>("hero");
  const [answers, setAnswers] = useState<Answers | null>(null);

  return (
    <>
      <Background />

      {stage === "deck" ? (
        <Deck onExit={() => setStage(answers ? "result" : "hero")} />
      ) : (
        // The footer sits outside <main> in the same column so its links are in
        // the server-rendered HTML — the deck's slides live in client state, so
        // this is the only crawl path from "/" into the content pages.
        <div className="flex min-h-dvh flex-col">
          <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
            {stage === "hero" && (
              <Hero
                onStart={() => setStage("quiz")}
                onSkip={() => setStage("deck")}
              />
            )}

            {stage === "quiz" && (
              <Quiz
                onBack={() => setStage("hero")}
                onComplete={(a) => {
                  setAnswers(a);
                  setStage("result");
                }}
              />
            )}

            {stage === "result" && answers && (
              <Result answers={answers} onContinue={() => setStage("deck")} />
            )}

            {stage !== "hero" && (
              <button
                onClick={() => setStage("deck")}
                className="mt-8 text-sm text-ink-soft underline transition hover:text-rust"
              >
                {hero.skip}
              </button>
            )}
          </main>

          <SiteFooter />
        </div>
      )}
    </>
  );
}
