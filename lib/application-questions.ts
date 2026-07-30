import { site } from "@/lib/content";

export type Question = {
  id: string;
  label: string;
  hint: string;
  placeholder?: string;
  type?: "text" | "textarea" | "scale" | "choice" | "multi";
  /** Tappable options for "choice" (single pick) and "multi" (pick many). */
  options?: string[];
  /**
   * Options that clear every other selection when tapped (and are cleared by
   * any other tap) — e.g. "Nothing — all clear" on the medical question.
   */
  exclusive?: string[];
  /** Two-up tiles instead of a stacked list — for short options. */
  layout?: "grid";
  /** Optional questions can be advanced past without an answer. */
  optional?: boolean;
};

/**
 * The application questions, adapted from the client's form PDF.
 *
 * Deliberately tap-first: only the name, the phone number, and one optional
 * closing note are typed. Everything else is a single- or multi-pick, because
 * the people filling this in are doing it on a phone between meetings and a
 * page of empty text boxes is where applications get abandoned.
 *
 * Defined once and shared by the form (client) and the /api/apply route
 * (server) so labels, order, and required-ness stay in sync between the UI and
 * the stored/emailed summary.
 *
 * Multi-pick answers are stored as a ", "-joined string, so multi options must
 * never contain a comma.
 */
export const questions: Question[] = [
  {
    id: "name",
    label: "First, what should Rudhra call you?",
    hint: "Just your first name is fine.",
    placeholder: "e.g. Priya",
  },
  {
    id: "age",
    label: "How old are you?",
    hint: "Training and recovery are dosed differently by decade.",
    type: "choice",
    layout: "grid",
    options: ["Under 25", "25–34", "35–44", "45–54", "55+"],
  },
  {
    id: "phone",
    label: "Your phone / WhatsApp number",
    hint: "This is how Rudhra will reach you for your consultation.",
    placeholder: "e.g. 98765 43210",
  },
  {
    id: "work",
    label: "What does your work look like?",
    hint: "This shapes when and how often you can realistically train.",
    type: "choice",
    options: [
      "Desk / office job",
      "Travel-heavy or field role",
      "Shift work — nights or rotating",
      "Business owner / founder",
      "Homemaker",
      "Student",
    ],
  },
  {
    id: "hours",
    label: "And your typical hours?",
    hint: "Be honest about the week you actually have, not the ideal one.",
    type: "choice",
    options: [
      "Standard — around 9 to 6",
      "Long — 10+ hours most days",
      "Unpredictable — changes week to week",
      "Flexible — I set my own hours",
    ],
  },
  {
    id: "why",
    label: "What's pushing you to start now?",
    hint: "Pick everything that applies.",
    type: "multi",
    options: [
      "Energy crashes through the day",
      "Weight has crept up over the years",
      "A health report or scare",
      "Clothes don't fit like they used to",
      "Tired of starting and stopping",
      "An event or trip coming up",
      "I want to feel strong again",
    ],
  },
  {
    id: "frustration",
    label: "How frustrated are you with your health and energy right now?",
    hint: "1 = totally fine · 10 = completely fed up. There's no wrong answer.",
    type: "scale",
  },
  {
    id: "meaning",
    label: "What would hitting this goal actually change?",
    hint: "Pick everything that applies — go beyond the physical.",
    type: "multi",
    options: [
      "Confidence in how I look",
      "Energy for my family",
      "Showing up sharper at work",
      "Coming off or reducing medication",
      "Feeling in control again",
      "Being able to keep up physically",
    ],
  },
  {
    id: "goal",
    label: "What's your primary fitness goal?",
    hint: "Pick the one that matters most — the rest tends to follow.",
    type: "choice",
    options: [
      "Lose fat and weight",
      "Build muscle",
      "Body recomposition",
      "Get stronger",
      "More energy and better sleep",
      "Manage stress and focus",
    ],
  },
  {
    id: "activity",
    label: "Where are you starting from?",
    hint: "There's no bad answer here — it just sets the first four weeks.",
    type: "choice",
    options: [
      "Nothing at the moment",
      "The odd walk or weekend game",
      "1–2 sessions a week",
      "Training regularly but stuck",
      "Was consistent before — fell off",
    ],
  },
  {
    id: "injuries",
    label: "Anything Rudhra should design around?",
    hint: "Pick anything that applies. You can add detail at the end.",
    type: "multi",
    exclusive: ["Nothing — all clear"],
    options: [
      "Nothing — all clear",
      "Knees",
      "Lower back",
      "Shoulder or neck",
      "Diabetes / thyroid / PCOS",
      "Blood pressure or cholesterol",
      "Recovering from injury or surgery",
    ],
  },
  {
    id: "access",
    label: "Where will you train?",
    hint: "The plan is built around what you actually have access to.",
    type: "choice",
    options: [
      "Full gym",
      "Home — dumbbells or bands",
      "Home — bodyweight only",
      "Both gym and home",
      "Not sure yet",
    ],
  },
  {
    id: "diet",
    label: "How do you eat?",
    hint: "Your nutrition plan is built inside this, never against it.",
    type: "choice",
    options: [
      "Vegetarian",
      "Vegetarian + eggs",
      "Non-vegetarian",
      "Vegan",
      "Jain",
      "I'll explain on the call",
    ],
  },
  {
    id: "commitment",
    label: "How many days a week can you commit to your 1:1 workouts?",
    hint: "Given your actual schedule — the plan is built on this.",
    type: "choice",
    layout: "grid",
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
  {
    id: "notes",
    label: "Anything else Rudhra should know?",
    hint: "Optional — allergies, past coaching, injuries in detail, anything on your mind.",
    type: "textarea",
    placeholder: "Skip this if there's nothing to add…",
    optional: true,
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
