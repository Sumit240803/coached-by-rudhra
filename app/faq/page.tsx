import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Card, LinkButton } from "@/components/ui";
import { faqs, site } from "@/lib/content";
import { breadcrumbNode, faqNode, graph, webPageNode } from "@/lib/seo";

const path = "/faq";
const title = "Online Personal Training FAQ — Travel, Cost, Beginners";
const description =
  "Answers to the most common questions about 1:1 online coaching with Rudhra: how it works if you travel for work, what it costs, whether it suits beginners, and how nutrition guidance is handled.";

export const metadata: Metadata = {
  title: "FAQ",
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    title,
    description,
    url: path,
    images: [{ url: "/opengraph-image", alt: `${site.name} — FAQ` }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function FaqPage() {
  return (
    <PageShell
      crumbs={[{ name: "FAQ", path }]}
      eyebrow="Before You Ask"
      lead="Fair"
      accent="Questions."
      jsonLd={graph(
        // ProfessionalService / WebSite / Person come from the root layout.
        faqNode(),
        webPageNode({ path, name: title, description }),
        breadcrumbNode([{ name: "FAQ", path }]),
      )}
    >
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Rendered as a description list so the question/answer pairing is
            explicit to assistive tech and to crawlers parsing the page body,
            matching the FAQPage schema emitted above. */}
        <Card>
          <dl className="divide-y divide-rust/10">
            {faqs.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="text-center">
          <p className="text-ink-soft">
            Still have a question? Book a free consultation and ask it directly.
          </p>
          <div className="mt-5">
            <LinkButton href="/apply">Book Your Free Consultation →</LinkButton>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Or email{" "}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-rust hover:underline"
            >
              {site.supportEmail}
            </a>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
