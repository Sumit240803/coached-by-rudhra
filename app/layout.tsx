import type { Metadata, Viewport } from "next";
import { Oswald, Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import {
  graph,
  organizationNode,
  personNode,
  websiteNode,
} from "@/lib/seo";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "personal trainer",
    "online fitness coach",
    "nutrition coaching",
    "1:1 training",
    "coaching for busy professionals",
    "fat loss",
    "muscle gain",
    "India",
    "CoachedByRudhra",
    "Rudhra",
  ],
  authors: [{ name: "Rudhra" }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/opengraph-image", alt: `${site.name} — ${site.tagline}` }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#b0522f",
};

// The business, the site, and the coach — emitted once on every page. Individual
// pages add only their own nodes (WebPage, BreadcrumbList, FAQPage, …) and refer
// back to these by @id, so nothing is declared twice.
const jsonLd = graph(organizationNode(), websiteNode(), personNode());

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {/* LOCAL PREVIEW ONLY — black & white variant toggle (app/mono-theme.css).
            ?theme=mono turns it on and it sticks across navigation; ?theme=off
            clears it. Runs synchronously before the page paints, so a screenshot
            can never catch the colour theme mid-swap. Remove before shipping. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=new URLSearchParams(location.search).get('theme');if(p)localStorage.setItem('previewTheme',p);if(localStorage.getItem('previewTheme')==='mono')document.documentElement.setAttribute('data-theme','mono');else document.documentElement.removeAttribute('data-theme');}catch(e){}})()",
          }}
        />
        {children}
        <JsonLd data={jsonLd} />
      </body>
    </html>
  );
}
