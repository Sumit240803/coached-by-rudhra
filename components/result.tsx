"use client";

import { useState } from "react";
import {
  goalDetail,
  goals,
  project,
  type Answers,
} from "@/lib/assessment";
import { site, whatsappLink } from "@/lib/content";
import { Button, Card, Eyebrow, LinkButton } from "@/components/ui";

export function Result({
  answers,
  onContinue,
}: {
  answers: Answers;
  onContinue: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const p = project(answers);
  if (!p) return null;

  const focusLabels = answers.goals
    .map((id) => goals.find((g) => g.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  const enquiry = `Hi Rudhra, I just did the assessment on your site. My goal: ${focusLabels}. I can train ${answers.commitment ?? "a few"} days a week. Can you tell me about the plans?`;

  return (
    <Card className="relative w-full max-w-lg overflow-hidden pt-8">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-rust" />

      <Eyebrow>Your Assessment</Eyebrow>

      <h2 className="mt-4 text-center font-display text-3xl leading-[0.95] font-bold sm:text-4xl">
        {p.headline} <span className="text-rust">{p.accent}</span>
      </h2>

      <p className="mt-3 text-center font-display text-sm tracking-wide text-rust">
        {p.weeks} weeks. Built around a {answers.commitment ?? "3"}-day week.
      </p>

      {p.mode !== "hold" && (
        <div className="mt-6 grid grid-cols-3 divide-x divide-rust/15">
          <Stat
            value={`${p.realisticChange} to ${p.maxChange}`}
            label={p.mode === "lose" ? "kg to lose" : "kg to gain"}
          />
          <Stat value={`${p.goalWeight} kg`} label="your goal weight" />
          <Stat value={`~${Math.round(p.bodyFat)}%`} label="body fat now" />
        </div>
      )}

      <p className="mt-6 text-center text-ink-soft">
        {p.mode === "lose" ? (
          <>
            The honest read: <strong className="text-rust">{p.maxChange} kg</strong>{" "}
            is what the statistics allow. Landing around{" "}
            <strong className="text-rust">{p.realisticChange} kg</strong> is
            realistic, sustainable, and the kind you never gain back.
          </>
        ) : p.mode === "gain" ? (
          <>
            Muscle is slower than the internet promises.{" "}
            <strong className="text-rust">
              {p.realisticChange} to {p.maxChange} kg
            </strong>{" "}
            of real tissue in {p.weeks} weeks is a strong, honest outcome.
          </>
        ) : (
          <>
            You picked goals the scale can&apos;t measure — and that&apos;s fine.
            We&apos;ll track energy, sleep, and strength instead.
          </>
        )}
      </p>

      {!expanded ? (
        <Button className="mt-6" onClick={() => setExpanded(true)}>
          🔎 See My Full Result →
        </Button>
      ) : (
        <div className="mt-8 border-t border-rust/15 pt-6">
          <Eyebrow>Your Full Result</Eyebrow>

          <p className="mt-4 text-center font-display text-sm leading-relaxed font-semibold tracking-wide text-rust">
            Your focus: {focusLabels}
          </p>

          <ul className="mt-5 divide-y divide-rust/10 rounded-tile bg-card-warm px-4">
            {answers.goals.map((id) => (
              <li key={id} className="py-3 text-sm">
                <span className="mr-2">
                  {goals.find((g) => g.id === id)?.emoji}
                </span>
                {goalDetail[id]}
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-tile border border-rust/20 p-4 text-center text-sm font-semibold">
            This is a fair, realistic target — and the point is that it holds.
            A plan you abandon in three weeks isn&apos;t a result. We build the
            version you can keep.
          </div>

          <div className="mt-6 space-y-3">
            <LinkButton href="/apply">📋 Apply For Coaching →</LinkButton>
            <LinkButton
              href={whatsappLink(enquiry)}
              target="_blank"
              rel="noopener noreferrer"
              tone="whatsapp"
            >
              💬 Talk To Rudhra On WhatsApp
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            📊 These numbers are statistical. They come from your height, weight,
            age band, and an estimated body fat percentage — not from seeing you.
            They vary person to person, and Rudhra fine-tunes the real targets
            during your free consultation. Personal training starts from{" "}
            {site.priceFrom} onwards.
          </p>

          <button
            onClick={onContinue}
            className="mt-5 w-full text-center font-display text-sm tracking-widest text-ink-soft underline transition hover:text-rust"
          >
            First, show me how this works →
          </button>
        </div>
      )}
    </Card>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 text-center">
      <div className="font-display text-xl font-bold text-rust sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 font-display text-[0.6rem] tracking-widest text-ink-soft">
        {label}
      </div>
    </div>
  );
}
