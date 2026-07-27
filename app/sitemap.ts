import type { MetadataRoute } from "next";
import { site, transformations, media } from "@/lib/content";

// Static marketing copy — the pages only change when the client's copy does, so
// a build-time stamp is the honest `lastmod` rather than a per-request `now`
// (which trains crawlers to distrust the value).
const lastModified = new Date("2026-07-27");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/coaching`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
      images: [`${site.url}${media.coachPortrait.src}`],
    },
    {
      url: `${site.url}/results`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: transformations.map((t) => `${site.url}${t.src}`),
    },
    {
      url: `${site.url}/faq`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${site.url}/apply`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
