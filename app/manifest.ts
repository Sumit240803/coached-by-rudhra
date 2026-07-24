import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Rudhra",
    description: site.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#faf6f1",
    theme_color: "#b0522f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
