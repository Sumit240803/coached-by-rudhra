import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { CoachBio } from "@/components/sections";
import { Card, LinkButton } from "@/components/ui";
import { media, site, whyPillars } from "@/lib/content";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo";

const path = "/about";
const title = "About Rudhra — Online Personal Trainer & Nutrition Coach";
const description =
  "Meet Rudhra, founder and head coach of COACHEDBYRUDHRA. Fully online 1:1 personal training and nutrition coaching built around the schedules of working professionals in India.";

export const metadata: Metadata = {
  title: "About Rudhra",
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "profile",
    title,
    description,
    url: path,
    images: [{ url: "/opengraph-image", alt: `${site.name} — About Rudhra` }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function AboutPage() {
  return (
    <PageShell
      crumbs={[{ name: "About Rudhra", path }]}
      eyebrow="Your Coach"
      lead="Meet"
      accent="Rudhra."
      intro={
        'Between deadlines, meetings, travel, and everything else on your plate, "eat clean and hit the gym" isn’t advice — it’s noise.'
      }
      jsonLd={graph(
        // ProfessionalService / WebSite / Person come from the root layout.
        webPageNode({ path, name: title, description }),
        breadcrumbNode([{ name: "About Rudhra", path }]),
      )}
    >
      <div className="mx-auto w-full max-w-xl space-y-8">
        <Card>
          <div className="overflow-hidden rounded-tile">
            <Image
              src={media.coachPortrait.src}
              width={media.coachPortrait.width}
              height={media.coachPortrait.height}
              alt="Rudhra, founder and head coach of CoachedByRudhra, an online personal trainer and nutrition coach."
              sizes="(min-width: 640px) 36rem, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="mt-6">
            <CoachBio />
          </div>
        </Card>

        <section aria-labelledby="approach">
          <h2
            id="approach"
            className="text-center font-display text-2xl font-bold"
          >
            The Coaching Approach
          </h2>
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

        <Card className="text-center">
          <p className="text-ink-soft">
            Coaching is fully online, so it works wherever your schedule takes
            you. Spots are limited each month.
          </p>
          <div className="mt-5">
            <LinkButton href="/apply">Book Your Free Consultation →</LinkButton>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
