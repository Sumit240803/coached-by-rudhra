/**
 * Single source of truth for every piece of client-supplied copy and asset.
 * Anything still waiting on Rudhra is marked PLACEHOLDER and surfaced in the UI
 * as an obvious stand-in, never as fabricated fact.
 */

export const site = {
  name: "COACHEDBYRUDHRA",
  tagline: "1:1 Personal Training & Nutrition Guidance for Busy Professionals",
  handle: "@coachedbyrudhra",
  // Canonical origin for SEO (metadata, sitemap, robots). Must be the host that
  // serves 200, not one that redirects: the apex 308s to www, so canonicals
  // pointing at the apex would send every crawler through a redirect. Set in
  // Vercel as NEXT_PUBLIC_SITE_URL; this fallback keeps local builds in sync.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.coachedbyrudhra.com",
  description:
    "1:1 personal training and nutrition guidance built for people with packed calendars, back-to-back meetings, and zero patience for plans that don't work. Fully online coaching from Rudhra.",
  instagram: "https://www.instagram.com/coachedbyrudhra/",
  supportEmail: "support@coachedbyrudhra.com",
  // Digits only, country code first (India +91).
  whatsappNumber: "917983374576",
  priceFrom: "₹10,000",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const hero = {
  badge: site.handle,
  headline: ["You Don't Need More Hours.", "You Need a Plan That"],
  headlineAccent: "Fits the Ones You Have.",
  sub: "1:1 personal training and nutrition guidance built for people with packed calendars, back-to-back meetings, and zero patience for plans that don't work.",
  cta: "Start Your Free Assessment",
  microcopy: "Six taps. No email. No signup.",
  skip: "I will do this later, just show me the page",
} as const;

/** Media lives in /public/media. See public/media/README.md for the asset brief. */
// Client-supplied training montage; the background cycles through them in order.
// Add more paths here to extend the rotation.
const heroVideos: string[] = ["/media/hero-1.mp4", "/media/hero-2.mp4"];

export const media = {
  heroVideos,
  heroPoster: "/media/hero-poster.jpg",
  coachPortrait: { src: "/rudhra-image.jpg", width: 1080, height: 1080 },
} as const;

// ---------------------------------------------------------------------------
// Story deck — every slide below is verbatim from the client's copy deck.
// ---------------------------------------------------------------------------

export type DeckSlide = {
  id: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  sub?: string;
  /** Label for the button that advances to the next slide. */
  next: string;
};

export const deckSlides: readonly DeckSlide[] = [
  {
    id: "meet",
    eyebrow: "Your Coach",
    title: "Meet",
    titleAccent: "Rudhra.",
    sub: "Between deadlines, meetings, travel, and everything else on your plate, \"eat clean and hit the gym\" isn't advice — it's noise.",
    next: "Why This Works",
  },
  {
    id: "why",
    eyebrow: "Why CoachedByRudhra",
    title: "Built Around",
    titleAccent: "Your Life.",
    sub: "Four things that make this different from every plan you've abandoned.",
    next: "The Program",
  },
  {
    id: "program",
    eyebrow: "The Program",
    title: "1:1 Training +",
    titleAccent: "Nutrition.",
    sub: "A fully personalized program, built around your actual schedule.",
    next: "Who This Is For",
  },
  {
    id: "who",
    eyebrow: "Who This Is For",
    title: "This Is Built",
    titleAccent: "For You If…",
    next: "What Changes",
  },
  {
    id: "changes",
    eyebrow: "What Changes For You",
    title: "The Results Show Up",
    titleAccent: "Everywhere.",
    sub: "The benefits go far beyond the gym.",
    next: "Real Results",
  },
  {
    id: "proof",
    eyebrow: "Proof, Not Promises",
    title: "Real People.",
    titleAccent: "Real Results.",
    sub: "Every one is a real client. The board slides on its own — touch to pause.",
    next: "Questions",
  },
  {
    id: "faq",
    eyebrow: "Before You Ask",
    title: "Fair",
    titleAccent: "Questions.",
    next: "Let's Talk",
  },
  {
    id: "cta",
    eyebrow: "Last Thing",
    title: "Your Career Gets Your Best Effort.",
    titleAccent: "Your Health Deserves It Too.",
    sub: "Book a free consultation and let's build a plan that fits your actual life.",
    next: "Apply Now",
  },
];

export const whyPillars = [
  {
    emoji: "🗓️",
    title: "Built Around Your Calendar",
    body: "Early meetings, late nights, travel weeks — your program adapts to your reality instead of demanding you rearrange your life for it.",
  },
  {
    emoji: "🎯",
    title: "True 1:1 Coaching",
    body: "No group templates. Direct access to your coach, a plan built specifically for your body and schedule, and real accountability.",
  },
  {
    emoji: "🍛",
    title: "Nutrition That Fits Your Life",
    body: "Eating out for work lunches, travel, client dinners — your nutrition plan is built to work with your reality, not against it.",
  },
  {
    emoji: "⚡",
    title: "Results You Can Feel at Work Too",
    body: "More energy, better focus, better sleep, more confidence in the room — the benefits show up far beyond the gym.",
  },
] as const;

export const programPillars = [
  {
    emoji: "🏋️",
    title: "1:1 Training Sessions",
    body: "Programming built around your goals, schedule, and current fitness level, with form correction and consistent progression.",
  },
  {
    emoji: "🥗",
    title: "Nutrition Guidance",
    body: "A practical, sustainable eating plan built around your routine, food preferences, and lifestyle — not restriction for the sake of restriction.",
  },
  {
    emoji: "🤝",
    title: "Ongoing Accountability",
    body: "Regular check-ins to keep you consistent even during your busiest weeks.",
  },
] as const;

export const whoThisIsFor = [
  "Professionals who want results without living at the gym",
  "Anyone whose energy, focus, or motivation has taken a hit from work stress",
  "People who've tried fitness apps and generic plans that didn't fit their schedule",
  "Men and women serious about investing in their health the same way they invest in their career",
] as const;

export const whatChanges = [
  { emoji: "🔋", text: "More energy through long workdays" },
  { emoji: "🧠", text: "Better focus and sharper decision-making" },
  { emoji: "😴", text: "Improved sleep and stress management" },
  { emoji: "💪", text: "Visible physical results — strength, body composition, confidence" },
  { emoji: "♾️", text: "A sustainable system, not another plan you'll abandon in three weeks" },
] as const;

export const faqs = [
  {
    q: "I travel frequently for work — can this still work for me?",
    a: "Yes. Programs are built to flex around travel, hotel gyms, and irregular schedules.",
  },
  {
    q: "I've never trained consistently before — is this still for me?",
    a: "Yes. Programs are built for your current fitness level, whether you're starting fresh or picking back up.",
  },
  {
    q: "Will the nutrition plan require cooking elaborate meals?",
    a: "No. Guidance is built around what's realistic for your routine — including eating out and travel days.",
  },
  {
    q: "How much does it cost?",
    a: "Personal training starts from 10,000 INR onwards, depending on the program and duration. This is discussed in detail during your free consultation.",
  },
  {
    q: "How do sessions work — online or in person?",
    a: "Coaching is fully online for now. Your training, nutrition, and check-ins are all delivered remotely and over WhatsApp, so it works wherever your schedule takes you.",
  },
] as const;

/**
 * Real client transformations supplied by the client. Three are branded social
 * posts with the result already baked into the image, so we display them whole
 * (never cropped) rather than adding captions that could contradict them. The
 * `alt` text mirrors what's visible for screen-reader and SEO parity.
 */
export const transformations = [
  {
    id: 1,
    src: "/transformation-1.jpg",
    width: 1080,
    height: 1350,
    alt: "Client transformation — 165 pounds, no crash diets, no extreme workouts.",
  },
  {
    id: 2,
    src: "/transformation-2.jpg",
    width: 1080,
    height: 1350,
    alt: "Client transformation — 4.5 kgs down in 40 days.",
  },
  {
    id: 3,
    src: "/transformation-3.jpg",
    width: 1080,
    height: 1350,
    alt: "Client transformation — before and after body recomposition.",
  },
  {
    id: 4,
    src: "/transformation-4.jpg",
    width: 1200,
    height: 1600,
    alt: "Client transformation — before and after.",
  },
] as const;
