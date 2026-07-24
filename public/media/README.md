# Media assets

These files are referenced by `lib/content.ts`. The site degrades gracefully if
any are missing (a warm gradient stands in for the video, dashed placeholder
frames stand in for photos), so nothing breaks.

| File | What it is | Status |
| --- | --- | --- |
| `hero-1.mp4`, `hero-2.mp4` | Training montage behind every screen | ✅ Supplied by client. The background cycles through them in order. Add more (`hero-3.mp4`, …) to `media.heroVideos` in `lib/content.ts` to extend the rotation. |
| `hero-poster.jpg` | First frame, shown before the video loads and for reduced-motion users | ✅ Extracted from `hero-1.mp4`. |
| `../rudhra-image.jpg` | Portrait of Rudhra, used on the "Meet Rudhra" slide | ✅ Supplied (lives at `public/rudhra-image.jpg`). |
| `../transformation-1..4.jpg` | Real client before/afters on the "Real Results" slide | ✅ Supplied (at `public/`). Three are branded posts with the result baked in; shown whole, never cropped. |

All client assets are now in. Nothing outstanding.

Client transformation photos are still outstanding too — see `transformations`
in `lib/content.ts`. Only publish images clients have agreed to.
