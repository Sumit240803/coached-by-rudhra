"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/content";
import { Button, Card, LinkButton } from "@/components/ui";

type Field = {
  id: string;
  n: number;
  label: string;
  hint: string;
  type?: "text" | "textarea" | "scale" | "yesno";
};

/** The 13 questions, verbatim from the client's application form PDF. */
const fields: Field[] = [
  { id: "name", n: 1, label: "Full Name & Age", hint: "Let's start with the basics." },
  {
    id: "phone",
    n: 2,
    label: "Phone / WhatsApp Number",
    hint: "This is how Rudhra will reach you for your consultation and check-ins.",
  },
  {
    id: "work",
    n: 3,
    label: "Occupation & Typical Work Schedule",
    hint: "Include work hours, travel days, or anything that affects your routine.",
    type: "textarea",
  },
  {
    id: "why",
    n: 4,
    label: "What's the real reason you want to start now — what changed?",
    hint: "Be honest. This helps Rudhra understand what's actually driving this decision.",
    type: "textarea",
  },
  {
    id: "frustration",
    n: 5,
    label:
      "On a scale of 1–10, how frustrated are you with where your health and energy are right now?",
    hint: "There's no wrong answer — this just helps gauge where you're starting from.",
    type: "scale",
  },
  {
    id: "meaning",
    n: 6,
    label: "What would achieving this goal actually mean for your life?",
    hint: "Confidence, energy, relationships, how you show up at work — go beyond the physical.",
    type: "textarea",
  },
  {
    id: "goal",
    n: 7,
    label: "Primary Fitness Goal",
    hint: "e.g. weight loss, muscle gain, strength, better energy, stress management.",
  },
  {
    id: "activity",
    n: 8,
    label: "Current Activity Level",
    hint: "Are you currently training, or starting from scratch?",
  },
  {
    id: "injuries",
    n: 9,
    label: "Any Injuries, Medical Conditions, or Physical Limitations",
    hint: "Anything Rudhra should design around.",
    type: "textarea",
  },
  {
    id: "access",
    n: 10,
    label: "Training Access & Preference",
    hint: "Gym membership, home equipment, or a hybrid of both?",
  },
  {
    id: "diet",
    n: 11,
    label: "Dietary Preferences / Restrictions",
    hint: "Veg, non-veg, vegan, allergies, or anything you avoid.",
  },
  {
    id: "commitment",
    n: 12,
    label: "Realistic Weekly Commitment",
    hint: "How many days a week can you consistently train, given your schedule?",
  },
  {
    id: "investment",
    n: 13,
    label: "Investment Comfort",
    hint: `Personal training with nutrition guidance starts from ${site.priceFrom} INR onwards. Are you comfortable investing at this level for your health and fitness goals?`,
    type: "yesno",
  },
];

export function ApplicationForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  function set(id: string, v: string) {
    setValues((s) => ({ ...s, [id]: v }));
  }

  const message = [
    `Hi Rudhra, here's my application:`,
    "",
    ...fields.map((f) => `${f.n}. ${f.label}\n${values[f.id]?.trim() || "—"}`),
  ].join("\n");

  const complete = fields.every((f) => values[f.id]?.trim());

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <Card key={f.id} className="p-5 sm:p-6">
          <label htmlFor={f.id} className="block">
            <span className="font-display text-base font-bold">
              <span className="mr-2 text-rust">{f.n}</span>
              {f.label}
            </span>
            <span className="mt-1 block text-xs text-ink-soft">{f.hint}</span>
          </label>

          {f.type === "scale" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={values[f.id] === n}
                  onClick={() => set(f.id, n)}
                  className={`h-10 w-10 rounded-tile border font-display transition ${
                    values[f.id] === n
                      ? "border-rust bg-rust text-white"
                      : "border-rust/20 bg-card-warm hover:border-rust/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : f.type === "yesno" ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["Yes, I'm comfortable", "I'd like to discuss"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={values[f.id] === opt}
                  onClick={() => set(f.id, opt)}
                  className={`rounded-tile border px-3 py-3 text-sm transition ${
                    values[f.id] === opt
                      ? "border-rust bg-rust/10"
                      : "border-rust/20 bg-card-warm hover:border-rust/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : f.type === "textarea" ? (
            <textarea
              id={f.id}
              rows={3}
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
              className="mt-3 w-full resize-y rounded-tile border border-rust/20 bg-card-warm px-3 py-2.5 text-sm outline-none focus:border-rust"
            />
          ) : (
            <input
              id={f.id}
              type="text"
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
              className="mt-3 w-full rounded-tile border border-rust/20 bg-card-warm px-3 py-2.5 text-sm outline-none focus:border-rust"
            />
          )}
        </Card>
      ))}

      <Card className="p-5 text-center sm:p-6">
        <p className="text-sm text-ink-soft">
          Sending opens WhatsApp with your answers filled in — review, then hit
          send. Spots for 1:1 coaching are limited each month.
        </p>
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
        {!complete && (
          <p className="mt-2 text-xs text-ink-faint">
            Answer all 13 questions to send.
          </p>
        )}
      </Card>
    </div>
  );
}
