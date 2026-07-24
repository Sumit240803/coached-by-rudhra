"use client";

import { useEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/lib/content";
import { Button, Card, LinkButton } from "@/components/ui";

type Question = {
  id: string;
  label: string;
  hint: string;
  placeholder?: string;
  type?: "text" | "textarea" | "scale" | "yesno";
  /** Optional questions can be advanced past without an answer. */
  optional?: boolean;
};

/** The 13 questions, verbatim from the client's application form PDF,
 *  asked one at a time to keep the form light and finishable. */
const questions: Question[] = [
  {
    id: "name",
    label: "First, your name and age",
    hint: "Let's start with the basics.",
    placeholder: "e.g. Priya, 34",
  },
  {
    id: "phone",
    label: "Your phone / WhatsApp number",
    hint: "This is how Rudhra will reach you for your consultation.",
    placeholder: "e.g. 98765 43210",
  },
  {
    id: "work",
    label: "What do you do, and what's your schedule like?",
    hint: "Work hours, travel days, anything that shapes your week.",
    type: "textarea",
    placeholder: "e.g. Product manager, 9–7, travel ~1 week a month…",
  },
  {
    id: "why",
    label: "Why do you want to start now — what changed?",
    hint: "Be honest. This helps Rudhra understand what's really driving this.",
    type: "textarea",
    placeholder: "What made today the day?",
  },
  {
    id: "frustration",
    label: "How frustrated are you with your health and energy right now?",
    hint: "1 = totally fine · 10 = completely fed up. There's no wrong answer.",
    type: "scale",
  },
  {
    id: "meaning",
    label: "What would hitting this goal actually mean for your life?",
    hint: "Confidence, energy, relationships, how you show up at work — go beyond the physical.",
    type: "textarea",
    placeholder: "Paint the picture…",
  },
  {
    id: "goal",
    label: "What's your primary fitness goal?",
    hint: "Weight loss, muscle, strength, energy, stress management.",
    placeholder: "e.g. Lose fat and feel less tired by 6pm",
  },
  {
    id: "activity",
    label: "What's your current activity level?",
    hint: "Training already, or starting from scratch?",
    placeholder: "e.g. Walk sometimes, haven't lifted in years",
  },
  {
    id: "injuries",
    label: "Any injuries, medical conditions, or limitations?",
    hint: "Anything Rudhra should design around. Type “None” if nothing applies.",
    type: "textarea",
    placeholder: "None, or describe…",
    optional: true,
  },
  {
    id: "access",
    label: "Where will you train?",
    hint: "Gym, home equipment, or a hybrid?",
    placeholder: "e.g. Building gym + a few dumbbells at home",
  },
  {
    id: "diet",
    label: "Any dietary preferences or restrictions?",
    hint: "Veg, non-veg, vegan, allergies, or anything you avoid.",
    placeholder: "e.g. Vegetarian, no eggs",
  },
  {
    id: "commitment",
    label: "Realistically, how many days a week can you train?",
    hint: "Given your actual schedule — the plan is built on this.",
    type: "text",
    placeholder: "e.g. 3 days, maybe 4 on a good week",
  },
  {
    id: "investment",
    label: "A quick one on investment",
    hint: `Coaching starts from ${site.priceFrom} INR onwards. Are you comfortable investing at this level in your health?`,
    type: "yesno",
  },
];

const TOTAL = questions.length;

export function ApplicationForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  // When editing from the review screen, jump straight back to review after.
  const [returnToReview, setReturnToReview] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isReview = step >= TOTAL;
  const q = questions[step];

  useEffect(() => {
    // Focus the field as each text step appears so typing is immediate.
    if (!isReview && (q?.type === undefined || q?.type === "textarea" || q?.type === "text")) {
      inputRef.current?.focus();
    }
  }, [step, isReview, q]);

  function set(id: string, v: string) {
    setValues((s) => ({ ...s, [id]: v }));
  }

  const currentValue = q ? (values[q.id] ?? "") : "";
  const currentValid = isReview || !!q?.optional || currentValue.trim().length > 0;

  function goNext() {
    if (returnToReview) {
      setReturnToReview(false);
      setStep(TOTAL);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL));
  }

  function goBack() {
    if (isReview) {
      setStep(TOTAL - 1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }

  /** Picking an option (scale / yes-no) records it and advances on its own. */
  function choose(id: string, v: string) {
    set(id, v);
    setTimeout(goNext, 160);
  }

  const message = [
    `Hi Rudhra, here's my application:`,
    "",
    ...questions.map(
      (item, i) => `${i + 1}. ${item.label}\n${values[item.id]?.trim() || "—"}`,
    ),
  ].join("\n");

  const answeredCount = questions.filter(
    (item) => values[item.id]?.trim() || item.optional,
  ).length;
  const complete = answeredCount === TOTAL;
  const progress = isReview ? 100 : (step / TOTAL) * 100;

  return (
    <Card className="relative w-full max-w-lg overflow-hidden pt-10">
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-cream-deep">
        <div
          className="h-full bg-rust transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        {step === 0 && !isReview ? (
          <span className="font-display text-sm tracking-widest text-ink-faint">
            Application
          </span>
        ) : (
          <button
            onClick={goBack}
            className="font-display text-sm tracking-widest text-ink-soft transition hover:text-rust"
          >
            ← Back
          </button>
        )}
        <span className="font-display text-sm tracking-widest text-rust">
          {isReview ? "Review" : `${step + 1} of ${TOTAL}`}
        </span>
      </div>

      {isReview ? (
        <ReviewStep
          questions={questions}
          values={values}
          complete={complete}
          message={message}
          onEdit={(i) => {
            setReturnToReview(true);
            setStep(i);
          }}
        />
      ) : (
        <div key={step} className="animate-step-in">
          <h2 className="font-display text-2xl leading-tight font-bold sm:text-[1.7rem]">
            {q.label}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{q.hint}</p>

          <div className="mt-6">
            {q.type === "scale" ? (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={currentValue === n}
                    onClick={() => choose(q.id, n)}
                    className={`h-12 rounded-tile border text-base font-display transition ${
                      currentValue === n
                        ? "border-rust bg-rust text-white"
                        : "border-rust/20 bg-card-warm hover:border-rust/60"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : q.type === "yesno" ? (
              <div className="grid gap-3">
                {["Yes, I'm comfortable", "I'd like to discuss it first"].map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={currentValue === opt}
                      onClick={() => choose(q.id, opt)}
                      className={`rounded-tile border px-4 py-4 text-left transition ${
                        currentValue === opt
                          ? "border-rust bg-rust/10 font-medium"
                          : "border-rust/20 bg-card-warm hover:border-rust/60"
                      }`}
                    >
                      {opt}
                    </button>
                  ),
                )}
              </div>
            ) : q.type === "textarea" ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                rows={3}
                value={currentValue}
                placeholder={q.placeholder}
                onChange={(e) => set(q.id, e.target.value)}
                className="w-full resize-y rounded-tile border border-rust/20 bg-card-warm px-4 py-3 text-base outline-none transition placeholder:text-ink-faint focus:border-rust focus:ring-2 focus:ring-rust/20"
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentValue}
                placeholder={q.placeholder}
                onChange={(e) => set(q.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentValid) goNext();
                }}
                className="w-full rounded-tile border border-rust/20 bg-card-warm px-4 py-3.5 text-base outline-none transition placeholder:text-ink-faint focus:border-rust focus:ring-2 focus:ring-rust/20"
              />
            )}
          </div>

          {/* Continue button only for the typed steps; picks auto-advance. */}
          {q.type !== "scale" && q.type !== "yesno" && (
            <div className="mt-6">
              <Button onClick={goNext} disabled={!currentValid}>
                Continue →
              </Button>
              {q.optional && !currentValue.trim() && (
                <button
                  onClick={goNext}
                  className="mt-3 w-full text-center text-sm text-ink-soft underline transition hover:text-rust"
                >
                  Skip — nothing to add
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dots */}
      <div className="mt-8 flex justify-center gap-1.5">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < step || isReview
                ? "w-1.5 bg-rust"
                : i === step
                  ? "w-4 bg-rust"
                  : "w-1.5 bg-rust/25"
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

function ReviewStep({
  questions,
  values,
  complete,
  message,
  onEdit,
}: {
  questions: Question[];
  values: Record<string, string>;
  complete: boolean;
  message: string;
  onEdit: (index: number) => void;
}) {
  return (
    <div className="animate-step-in">
      <h2 className="font-display text-2xl font-bold sm:text-[1.7rem]">
        Looks good?
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Quick check before you send — tap any line to edit.
      </p>

      <ul className="mt-5 divide-y divide-rust/10">
        {questions.map((q, i) => {
          const v = values[q.id]?.trim();
          return (
            <li key={q.id}>
              <button
                onClick={() => onEdit(i)}
                className="group flex w-full items-start gap-3 py-3 text-left"
              >
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-cream-deep text-[0.7rem] font-semibold text-ink-soft">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-ink-soft">{q.label}</span>
                  <span
                    className={`block truncate text-sm ${v ? "text-ink" : "text-ink-faint italic"}`}
                  >
                    {v || "Skipped"}
                  </span>
                </span>
                <span className="mt-0.5 font-display text-xs tracking-wide text-rust opacity-0 transition group-hover:opacity-100">
                  Edit
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-tile bg-card-warm p-4 text-center text-sm text-ink-soft">
        Sending opens WhatsApp with everything filled in — just review and hit
        send. Spots for 1:1 coaching are limited each month.
      </div>

      {complete ? (
        <LinkButton
          className="mt-4"
          tone="whatsapp"
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 Send Application On WhatsApp
        </LinkButton>
      ) : (
        <Button className="mt-4" tone="whatsapp" disabled>
          💬 Send Application On WhatsApp
        </Button>
      )}
    </div>
  );
}
