import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social share card. System fonts keep it dependency-free.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #17120f 0%, #000000 100%)",
          color: "#faf6f1",
          fontFamily: "sans-serif",
        }}
      >
        {/* Dumbbell mark */}
        <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#faf6f1" />
          <g fill="#17120f">
            <rect x="10" y="14.5" width="12" height="3" rx="1.5" />
            <rect x="7" y="10" width="3.2" height="12" rx="1.4" />
            <rect x="21.8" y="10" width="3.2" height="12" rx="1.4" />
            <rect x="4" y="12.5" width="2.6" height="7" rx="1.2" />
            <rect x="25.4" y="12.5" width="2.6" height="7" rx="1.2" />
          </g>
        </svg>

        <div
          style={{
            marginTop: 40,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 36,
            fontWeight: 500,
            maxWidth: 900,
            color: "#f7e6db",
          }}
        >
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
