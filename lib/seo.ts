/**
 * Structured data (JSON-LD) for the whole site.
 *
 * Everything here is derived from `lib/content.ts` so the schema can never drift
 * from the copy on the page — Google penalises structured data that claims more
 * than the visible page does. Facts we don't have from the client (street
 * address, geo coordinates, opening hours, review counts) are deliberately
 * omitted rather than invented.
 *
 * Nodes are linked by `@id` so each page emits one `@graph` that references the
 * single canonical business node instead of redeclaring it.
 */

import { faqs, programPillars, site } from "@/lib/content";

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;
export const PERSON_ID = `${site.url}/about#rudhra`;

/** The business itself. Referenced from every other node. */
export function organizationNode() {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "Coached By Rudhra",
    description: site.description,
    slogan: site.tagline,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    logo: `${site.url}/icon.svg`,
    email: site.supportEmail,
    telephone: `+${site.whatsappNumber}`,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    availableLanguage: "en",
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [site.instagram],
    founder: { "@id": PERSON_ID },
    employee: { "@id": PERSON_ID },
    knowsAbout: [
      "Personal training",
      "Nutrition coaching",
      "Fat loss",
      "Muscle gain",
      "Habit and lifestyle coaching for working professionals",
    ],
    // Coaching is delivered entirely online, so the "location" is the channel.
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${site.url}/apply`,
      availableLanguage: "en",
    },
    makesOffer: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "10000",
      offerCount: programPillars.length,
      category: "1:1 Personal Training & Nutrition Coaching",
      availability: "https://schema.org/LimitedAvailability",
      url: `${site.url}/coaching`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "1:1 Coaching",
      itemListElement: programPillars.map((p) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: p.title,
          description: p.body,
        },
      })),
    },
  };
}

/** The site as a whole, for sitelinks and brand queries. */
export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en-IN",
    publisher: { "@id": ORG_ID },
  };
}

/** Rudhra as a person — powers the knowledge-panel style entity for the coach. */
export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Rudhra",
    jobTitle: "Personal Trainer & Nutrition Coach",
    description:
      "Founder and head coach of COACHEDBYRUDHRA, offering fully online 1:1 personal training and nutrition guidance for busy professionals.",
    url: `${site.url}/about`,
    image: `${site.url}/rudhra-image.jpg`,
    sameAs: [site.instagram],
    worksFor: { "@id": ORG_ID },
  };
}

/** Rich-result eligible FAQ block, built from the same five Q&As the page shows. */
export function faqNode() {
  return {
    "@type": "FAQPage",
    "@id": `${site.url}/faq#faqpage`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** The coaching product, for /coaching. */
export function serviceNode() {
  return {
    "@type": "Service",
    "@id": `${site.url}/coaching#service`,
    name: "1:1 Online Personal Training & Nutrition Coaching",
    serviceType: "Online personal training and nutrition coaching",
    description:
      "A fully personalised 1:1 training and nutrition program built around the schedule of a working professional, including programming, nutrition guidance and ongoing accountability check-ins.",
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "India" },
    audience: {
      "@type": "Audience",
      audienceType: "Busy working professionals",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "10000",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        minPrice: "10000",
        valueAddedTaxIncluded: false,
      },
      availability: "https://schema.org/LimitedAvailability",
      url: `${site.url}/apply`,
    },
  };
}

export type Crumb = { name: string; path: string };

/** `trail` excludes Home — it is prepended here so every page agrees on the root. */
export function breadcrumbNode(trail: Crumb[]) {
  const items: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${site.url}${c.path === "/" ? "/" : c.path}`,
    })),
  };
}

/** Describes the page itself and ties it back to the site + business. */
export function webPageNode({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@type": "WebPage",
    "@id": `${site.url}${path}#webpage`,
    url: `${site.url}${path}`,
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    primaryImageOfPage: `${site.url}/opengraph-image`,
  };
}

/** Wraps nodes into the single `@graph` payload a page should emit. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
