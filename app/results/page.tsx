import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { Card, LinkButton } from "@/components/ui";
import { site, transformations, whatChanges } from "@/lib/content";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo";

const path = "/results";
const title = "Client Results — Real Transformations, No Crash Diets";
const description =
  "Real client transformations from 1:1 online coaching with Rudhra — sustainable fat loss and body recomposition achieved without crash diets or extreme workouts.";

export const metadata: Metadata = {
  title: "Client Results",
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    title,
    description,
    url: path,
    images: [{ url: "/opengraph-image", alt: `${site.name} — Client Results` }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function ResultsPage() {
  return (
    <PageShell
      crumbs={[{ name: "Client Results", path }]}
      eyebrow="Proof, Not Promises"
      lead="Real People."
      accent="Real Results."
      intro="Every one of these is a real client."
      jsonLd={graph(
        // ProfessionalService / WebSite / Person come from the root layout.
        {
          "@type": "ImageGallery",
          "@id": `${site.url}${path}#gallery`,
          name: "Client transformations",
          isPartOf: { "@id": `${site.url}${path}#webpage` },
          associatedMedia: transformations.map((t) => ({
            "@type": "ImageObject",
            contentUrl: `${site.url}${t.src}`,
            caption: t.alt,
            width: t.width,
            height: t.height,
            representativeOfPage: t.id === 1,
          })),
        },
        webPageNode({ path, name: title, description }),
        breadcrumbNode([{ name: "Client Results", path }]),
      )}
    >
      <div className="mx-auto w-full max-w-3xl space-y-10">
        {/* A static grid rather than the homepage marquee: every image needs to
            sit in the initial HTML at a stable position for image indexing. */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {transformations.map((t, i) => (
            <li
              key={t.id}
              className="overflow-hidden rounded-card bg-card shadow-tile"
            >
              <Image
                src={t.src}
                width={t.width}
                height={t.height}
                alt={t.alt}
                sizes="(min-width: 640px) 15rem, 45vw"
                className="h-auto w-full"
                priority={i === 0}
              />
            </li>
          ))}
        </ul>

        <section aria-labelledby="beyond">
          <h2
            id="beyond"
            className="text-center font-display text-2xl font-bold"
          >
            The Results Show Up Everywhere
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

        <Card className="mx-auto max-w-lg text-center">
          <p className="text-ink-soft">
            Your career gets your best effort. Your health deserves it too.
          </p>
          <div className="mt-5">
            <LinkButton href="/apply">Book Your Free Consultation →</LinkButton>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
