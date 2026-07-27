import { site } from "@/lib/content";

export type Question = {
  id: string;
  label: string;
  hint: string;
  placeholder?: string;
  type?: "text" | "textarea" | "scale" | "yesno" | "choice";
  /** Tappable options for "choice" (and, if given, "yesno") questions. */
  options?: string[];
  /** Optional questions can be advanced past without an answer. */
  optional?: boolean;
};

/**
 * The 13 application questions, verbatim from the client's form PDF.
 * Shared by the form (client) and the /api/apply route (server) so labels,
 * order, and required-ness stay in sync between the UI and the stored/emailed
 * summary.
 */
export const questions: Question[] = [
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
    label: "How many days a week can you commit to your 1:1 workouts?",
    hint: "Given your actual schedule — the plan is built on this.",
    type: "choice",
    options: ["2 days", "3 days"],
  },
  {
    id: "investment",
    label: "A quick one on investment",
    hint: `Coaching starts from ${site.priceFrom} INR onwards. Are you comfortable investing at this level in your health?`,
    type: "choice",
    options: [
      "Yes, I'm comfortable",
      "I'd like to discuss it first",
      "It's not in my budget right now",
    ],
  },
];

/** Numbered, readable "N. Label\nanswer" summary of a submission. */
export function buildSummary(answers: Record<string, string>): string {
  return questions
    .map(
      (q, i) => `${i + 1}. ${q.label}\n${(answers[q.id] ?? "").trim() || "—"}`,
    )
    .join("\n\n");
}
