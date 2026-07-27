import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Card, LinkButton } from "@/components/ui";
import {
  programPillars,
  site,
  whatChanges,
  whoThisIsFor,
  whyPillars,
} from "@/lib/content";
import { breadcrumbNode, graph, serviceNode, webPageNode } from "@/lib/seo";

const path = "/coaching";
const title =
  "1:1 Online Personal Training & Nutrition Coaching — From ₹10,000";
const description =
  "A fully personalised 1:1 online personal training and nutrition program for busy professionals: training built around your calendar, practical nutrition guidance, and ongoing accountability. From ₹10,000 onwards.";

export const metadata: Metadata = {
  title: "Coaching & Pricing",
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    title,
    description,
    url: path,
    images: [
      { url: "/opengraph-image", alt: `${site.name} — Coaching & Pricing` },
    ],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function CoachingPage() {
  return (
    <PageShell
      crumbs={[{ name: "Coaching & Pricing", path }]}
      eyebrow="The Program"
      lead="1:1 Training +"
      accent="Nutrition."
      intro="A fully personalized program, built around your actual schedule."
      jsonLd={graph(
        // ProfessionalService / WebSite / Person come from the root layout.
        serviceNode(),
        webPageNode({ path, name: title, description }),
        breadcrumbNode([{ name: "Coaching & Pricing", path }]),
      )}
    >
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <section aria-labelledby="whats-included">
          <h2 id="whats-included" className="sr-only">
            What&apos;s included
          </h2>
          <div className="space-y-4">
            {programPillars.map((p) => (
              <Card key={p.title} className="p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold text-rust">
                  <span className="mr-2" aria-hidden="true">
                    {p.emoji}
                  </span>
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {p.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="pricing">
          <h2 id="pricing" className="sr-only">
            Pricing
          </h2>
          <Card className="border border-rust/20 p-5 text-center">
            <p className="font-display text-2xl font-bold text-rust">
              From {site.priceFrom} onwards
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Depending on program and duration — discussed in detail during your
              free consultation.
            </p>
          </Card>
        </section>

        <section aria-labelledby="why-different">
          <h2
            id="why-different"
            className="text-center font-display text-2xl font-bold"
          >
            Built Around Your Life
          </h2>
          <p className="mt-2 text-center text-sm text-ink-soft">
            Four things that make this different from every plan you&apos;ve
            abandoned.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {whyPillars.map((p) => (
              <Card key={p.title} className="p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold">
                  <span className="mr-2" aria-hidden="true">
                    {p.emoji}
                  </span>
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {p.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="who-for">
          <h2
            id="who-for"
            className="text-center font-display text-2xl font-bold"
          >
            Who This Is For
          </h2>
          <Card className="mt-5">
            <ul className="divide-y divide-rust/10">
              {whoThisIsFor.map((item) => (
                <li key={item} className="flex gap-3 py-4">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-rust"
                  />
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="outcomes">
          <h2
            id="outcomes"
            className="text-center font-display text-2xl font-bold"
          >
            What Changes For You
          </h2>
          <p className="mt-2 text-center text-sm text-ink-soft">
            The benefits go far beyond the gym.
          </p>
          <Card className="mt-5">
            <ul className="divide-y divide-rust/10">
              {whatChanges.map((c) => (
                <li key={c.text} className="flex gap-3 py-4">
                  <span className="text-lg" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <span className="text-ink-soft">{c.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <Card className="text-center">
          <p className="text-ink-soft">
            Spots for 1:1 coaching are limited each month, so every client gets
            real attention.
          </p>
          <div className="mt-5">
            <LinkButton href="/apply">Book Your Free Consultation →</LinkButton>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
