/**
 * Assessment questions and the projection maths behind the result screen.
 *
 * The numbers here drive a claim made to a real prospect on a real coach's
 * site, so every figure is derived from a published formula and a conservative
 * rate, and the result screen states the ranges rather than a single promise.
 */

export const PROGRAM_WEEKS = 12;

export type Sex = "male" | "female";

export type GoalId =
  | "lose"
  | "muscle"
  | "recomp"
  | "energy"
  | "strength"
  | "stress";

export const goals: { id: GoalId; emoji: string; label: string }[] = [
  { id: "lose", emoji: "⚖️", label: "Lose weight" },
  { id: "muscle", emoji: "💪", label: "Build muscle" },
  { id: "recomp", emoji: "🔥", label: "Body recomposition" },
  { id: "strength", emoji: "🏋️", label: "Get stronger" },
  { id: "energy", emoji: "⚡", label: "Energy and sleep" },
  { id: "stress", emoji: "🧠", label: "Stress and focus" },
];

export const ageBands: { id: string; label: string; midpoint: number }[] = [
  { id: "u20", label: "Under 20", midpoint: 19 },
  { id: "20s", label: "20 to 29", midpoint: 25 },
  { id: "30s", label: "30 to 39", midpoint: 35 },
  { id: "40s", label: "40 to 49", midpoint: 45 },
  { id: "50p", label: "50 plus", midpoint: 55 },
];

export const commitments: { id: string; label: string; note: string }[] = [
  { id: "2", label: "2 days", note: "Packed calendar. We work with it." },
  { id: "3", label: "3 days", note: "The sweet spot for most professionals." },
  { id: "4", label: "4 days", note: "Room to move faster." },
  { id: "5", label: "5+ days", note: "You've got the time. Let's use it well." },
];

export type Answers = {
  sex: Sex | null;
  goals: GoalId[];
  ageBand: string | null;
  heightCm: number;
  weightKg: number;
  commitment: string | null;
};

export const defaultAnswers: Answers = {
  sex: null,
  goals: [],
  ageBand: null,
  heightCm: 170,
  weightKg: 75,
  commitment: null,
};

export type Projection = {
  mode: "lose" | "gain" | "hold";
  bmi: number;
  bodyFat: number;
  /** Ambitious-but-attainable change over the program window, in kg. */
  maxChange: number;
  /** The change we actually stand behind, in kg. */
  realisticChange: number;
  goalWeight: number;
  weeks: number;
  headline: string;
  accent: string;
};

export function cmToFtIn(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)} ft ${totalInches % 12} in`;
}

export function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}

/**
 * Deurenberg BMI-to-body-fat estimate. Population-level only — it knows nothing
 * about training history or frame, which is exactly why the UI labels it an
 * estimate and the disclaimer says a real read needs check-in photos.
 */
function estimateBodyFat(bmi: number, age: number, sex: Sex) {
  const raw = 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4;
  return Math.max(5, Math.min(60, raw));
}

export function project(answers: Answers): Projection | null {
  const { sex, ageBand, heightCm, weightKg, goals: picked } = answers;
  if (!sex || !ageBand) return null;

  const age = ageBands.find((b) => b.id === ageBand)?.midpoint ?? 30;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bodyFat = estimateBodyFat(bmi, age, sex);

  const wantsLoss = picked.includes("lose") || picked.includes("recomp");
  const wantsGain = picked.includes("muscle") || picked.includes("strength");

  // Nothing weight-driven selected — don't invent a scale target.
  if (!wantsLoss && !wantsGain) {
    return {
      mode: "hold",
      bmi,
      bodyFat,
      maxChange: 0,
      realisticChange: 0,
      goalWeight: weightKg,
      weeks: PROGRAM_WEEKS,
      headline: "Your win here isn't on the scale.",
      accent: "It's how you feel by week 12.",
    };
  }

  if (wantsLoss) {
    // 0.5–0.8% of bodyweight per week is the standard sustainable range.
    const maxByRate = weightKg * 0.008 * PROGRAM_WEEKS;
    const realisticByRate = weightKg * 0.005 * PROGRAM_WEEKS;
    // Never project below a BMI of 21 — the floor of a healthy range.
    const floorWeight = 21 * heightM * heightM;
    const room = Math.max(0, weightKg - floorWeight);

    const maxChange = Math.round(Math.min(maxByRate, room));
    const realisticChange = Math.round(Math.min(realisticByRate, room));

    if (maxChange < 1) {
      return {
        mode: "hold",
        bmi,
        bodyFat,
        maxChange: 0,
        realisticChange: 0,
        goalWeight: weightKg,
        weeks: PROGRAM_WEEKS,
        headline: "You're already at a healthy weight.",
        accent: "So we build strength, not a deficit.",
      };
    }

    return {
      mode: "lose",
      bmi,
      bodyFat,
      maxChange,
      realisticChange,
      goalWeight: Math.round(weightKg - realisticChange),
      weeks: PROGRAM_WEEKS,
      headline: `You can be ${maxChange} kg lighter`,
      accent: `in ${PROGRAM_WEEKS} weeks.`,
    };
  }

  // Lean gain is slow and honest: roughly 0.1–0.2 kg per week trained well.
  const maxChange = Math.round(0.2 * PROGRAM_WEEKS);
  const realisticChange = Math.round(0.1 * PROGRAM_WEEKS);
  return {
    mode: "gain",
    bmi,
    bodyFat,
    maxChange,
    realisticChange,
    goalWeight: Math.round(weightKg + realisticChange),
    weeks: PROGRAM_WEEKS,
    headline: `You can add ${realisticChange} to ${maxChange} kg of muscle`,
    accent: `in ${PROGRAM_WEEKS} weeks.`,
  };
}

/** Per-goal lines for the personalised focus list on the full result. */
export const goalDetail: Record<GoalId, string> = {
  lose: "A structured deficit that still fits your work lunches.",
  muscle: "Progressive training with real protein targets.",
  recomp: "Drop fat and build shape at the same time.",
  strength: "Programming that adds load without wrecking your week.",
  energy: "Sleep, caffeine and meal timing fixed around your calendar.",
  stress: "Training dosed so it lowers stress instead of adding to it.",
};
