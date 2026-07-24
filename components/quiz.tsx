"use client";

import { useState } from "react";
import {
  ageBands,
  cmToFtIn,
  commitments,
  defaultAnswers,
  goals,
  kgToLb,
  type Answers,
  type GoalId,
} from "@/lib/assessment";
import { Button, Card } from "@/components/ui";

const STEPS = 6;

export function Quiz({
  onComplete,
  onBack,
}: {
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function next() {
    if (step === STEPS - 1) onComplete(answers);
    else setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  }

  /** Picking an option should advance on its own — no extra Next tap. */
  function choose<K extends keyof Answers>(key: K, value: Answers[K]) {
    set(key, value);
    setTimeout(next, 140);
  }

  function toggleGoal(id: GoalId) {
    setAnswers((a) => ({
      ...a,
      goals: a.goals.includes(id)
        ? a.goals.filter((g) => g !== id)
        : [...a.goals, id],
    }));
  }

  return (
    <Card className="relative w-full max-w-lg overflow-hidden pt-10">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-cream-deep">
        <div
          className="h-full bg-rust transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS) * 100}%` }}
        />
      </div>

      <button
        onClick={back}
        className="absolute top-4 left-5 font-display text-sm tracking-widest text-ink-soft transition hover:text-rust"
      >
        ← Back
      </button>

      <div className="mt-4 min-h-[19rem]">
        {step === 0 && (
          <Step title="You Are">
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((s) => (
                <Choice
                  key={s}
                  selected={answers.sex === s}
                  onClick={() => choose("sex", s)}
                >
                  {s === "male" ? "Male" : "Female"}
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="What Is Your Goal?" sub="Choose as many as you want">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {goals.map((g) => (
                <Choice
                  key={g.id}
                  selected={answers.goals.includes(g.id)}
                  onClick={() => toggleGoal(g.id)}
                  align="left"
                >
                  <span className="mr-2">{g.emoji}</span>
                  {g.label}
                </Choice>
              ))}
            </div>
            <Button
              className="mt-5"
              onClick={next}
              disabled={answers.goals.length === 0}
            >
              Next
            </Button>
          </Step>
        )}

        {step === 2 && (
          <Step title="Your Age">
            <div className="flex flex-wrap justify-center gap-2.5">
              {ageBands.map((b) => (
                <Choice
                  key={b.id}
                  selected={answers.ageBand === b.id}
                  onClick={() => choose("ageBand", b.id)}
                  className="flex-none px-5"
                >
                  {b.label}
                </Choice>
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Your Height">
            <Readout value={answers.heightCm} unit="cm" note={cmToFtIn(answers.heightCm)} />
            <Slider
              min={140}
              max={210}
              value={answers.heightCm}
              onChange={(v) => set("heightCm", v)}
              label="Height in centimetres"
            />
            <Button className="mt-6" onClick={next}>
              Next
            </Button>
          </Step>
        )}

        {step === 4 && (
          <Step title="Your Weight Right Now">
            <Readout
              value={answers.weightKg}
              unit="kg"
              note={`${kgToLb(answers.weightKg)} lb`}
            />
            <Slider
              min={40}
              max={160}
              value={answers.weightKg}
              onChange={(v) => set("weightKg", v)}
              label="Weight in kilograms"
            />
            <Button className="mt-6" onClick={next}>
              Next
            </Button>
          </Step>
        )}

        {step === 5 && (
          <Step
            title="Realistic Weekly Commitment"
            sub="Given your actual schedule — be honest, the plan is built on this."
          >
            <div className="grid grid-cols-1 gap-2.5">
              {commitments.map((c) => (
                <Choice
                  key={c.id}
                  selected={answers.commitment === c.id}
                  onClick={() => choose("commitment", c.id)}
                  align="left"
                >
                  <span className="font-semibold">{c.label}</span>
                  <span className="ml-2 text-sm text-ink-soft">{c.note}</span>
                </Choice>
              ))}
            </div>
          </Step>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition ${
              i <= step ? "bg-rust" : "bg-rust/25"
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

function Step({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-1 text-center text-sm text-ink-soft">{sub}</p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({
  children,
  selected,
  onClick,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-tile border px-4 py-4 font-sans transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust ${
        align === "left" ? "text-left" : "text-center"
      } ${
        selected
          ? "border-rust bg-rust/10 text-ink"
          : "border-rust/20 bg-card-warm text-ink hover:border-rust/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Readout({
  value,
  unit,
  note,
}: {
  value: number;
  unit: string;
  note: string;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-6xl font-bold text-rust">
        {value}
        <span className="ml-1 align-top text-xl">{unit}</span>
      </div>
      <div className="mt-1 text-sm text-ink-soft">{note}</div>
    </div>
  );
}

function Slider({
  min,
  max,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-6 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rust-soft/50 accent-rust"
    />
  );
}
