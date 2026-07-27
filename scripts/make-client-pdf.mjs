/**
 * Renders CLIENT-GUIDE.md to a branded, print-ready CLIENT-GUIDE.pdf.
 *
 * Re-run this whenever CLIENT-GUIDE.md changes — the PDF is a build artefact,
 * not a second source of truth.
 *
 *   npm i --no-save marked playwright && npx playwright install chromium
 *   node scripts/make-client-pdf.mjs
 */
import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));

const SRC = resolve(here, "../CLIENT-GUIDE.md");
const OUT = resolve(here, "../CLIENT-GUIDE.pdf");

const md = fs.readFileSync(SRC, "utf8");

// Drop the H1 + the two lines under it; the cover block below replaces them.
const body = md.replace(/^#\s+.*\n+(?:.*\n)*?---\n/, "");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>COACHEDBYRUDHRA — Your Website Guide</title>
<style>
  @page { size: A4; margin: 17mm 16mm 20mm; }

  :root {
    --rust: #b0522f;
    --rust-dark: #90411f;
    --ink: #2b1d16;
    --ink-soft: #5f5048;
    --ink-faint: #8a7768;
    --cream: #faf6f1;
    --cream-deep: #f2eae0;
    --line: #e8dccd;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.4pt;
    line-height: 1.62;
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ---------- cover ---------- */
  .cover {
    border-top: 6px solid var(--rust);
    background: var(--cream-deep);
    border-radius: 0 0 10px 10px;
    padding: 26px 28px 24px;
    margin-bottom: 30px;
  }
  .cover .brand {
    font-size: 8.6pt;
    letter-spacing: .2em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--rust);
  }
  .cover h1 {
    margin: 8px 0 6px;
    font-size: 25pt;
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -.01em;
    color: var(--ink);
    border: 0;
    padding: 0;
  }
  .cover p {
    margin: 0;
    font-size: 10.6pt;
    color: var(--ink-soft);
    max-width: 68ch;
  }
  .cover .note {
    margin-top: 12px;
    font-size: 9pt;
    color: var(--ink-faint);
    font-style: italic;
  }

  /* ---------- headings ---------- */
  h2 {
    font-size: 15.5pt;
    font-weight: 800;
    color: var(--ink);
    margin: 30px 0 12px;
    padding-bottom: 7px;
    border-bottom: 2px solid var(--rust);
    break-after: avoid;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.8pt;
    font-weight: 700;
    color: var(--rust-dark);
    margin: 20px 0 7px;
    break-after: avoid;
    page-break-after: avoid;
  }
  h2 + h3 { margin-top: 12px; }

  p { margin: 0 0 10px; orphans: 3; widows: 3; }

  a { color: var(--rust-dark); text-decoration: none; border-bottom: 1px solid rgba(176,82,47,.35); }

  strong { color: var(--ink); font-weight: 700; }
  em { color: var(--ink-soft); }

  ul, ol { margin: 0 0 12px; padding-left: 20px; }
  li { margin-bottom: 5px; }
  li::marker { color: var(--rust); }

  /* ---------- callouts ---------- */
  blockquote {
    margin: 14px 0;
    padding: 12px 16px;
    background: #fdf4ee;
    border-left: 4px solid var(--rust);
    border-radius: 0 8px 8px 0;
    color: var(--ink);
    break-inside: avoid;
    page-break-inside: avoid;
  }
  blockquote p:last-child { margin-bottom: 0; }

  /* ---------- tables ---------- */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    font-size: 9.6pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  thead th {
    background: var(--rust);
    color: #fff;
    text-align: left;
    font-weight: 700;
    font-size: 8.8pt;
    letter-spacing: .05em;
    text-transform: uppercase;
    padding: 8px 11px;
  }
  thead th:first-child { border-radius: 6px 0 0 0; }
  thead th:last-child  { border-radius: 0 6px 0 0; }
  tbody td {
    padding: 8px 11px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
    color: var(--ink-soft);
  }
  tbody td strong { color: var(--ink); }
  tbody tr:nth-child(even) { background: #fbf7f2; }

  /* Headerless reference tables: a rule on top instead of an empty colour bar */
  table.no-head { border-top: 2px solid var(--rust); }
  table.no-head tbody tr:first-child td { padding-top: 10px; }
  /* ...unless the heading directly above already drew one. */
  h2 + table.no-head, h3 + table.no-head { border-top: 0; margin-top: 4px; }

  /* Two-column reference tables read better without a header row shout */
  code {
    font-family: "Cascadia Mono", Consolas, "SF Mono", Menlo, monospace;
    font-size: 9pt;
    background: var(--cream-deep);
    color: var(--rust-dark);
    padding: 1px 5px;
    border-radius: 4px;
  }

  hr {
    border: 0;
    border-top: 1px solid var(--line);
    margin: 26px 0;
  }

  /* Keep a heading with the paragraph that follows it */
  h2, h3 { break-inside: avoid; page-break-inside: avoid; }
</style>
</head>
<body>
  <div class="cover">
    <div class="brand">CoachedByRudhra</div>
    <h1>Your Website Guide</h1>
    <p>Running your site day to day: reading applications, replying to emails, and getting found on Google.</p>
    <div class="note">A separate technical document exists for whoever maintains the code. You don’t need it.</div>
  </div>
  ${marked.parse(body)}
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });

// The two-column reference tables have no header text, which otherwise prints
// as a bare rust bar. Drop the header row and round the first body row instead.
await page.evaluate(() => {
  for (const thead of document.querySelectorAll("thead")) {
    if (thead.textContent.trim() === "") {
      const table = thead.closest("table");
      thead.remove();
      table.classList.add("no-head");
    }
  }
});

await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: `
    <div style="width:100%;font-family:Segoe UI,Arial,sans-serif;font-size:7.5pt;color:#8a7768;
                padding:0 16mm;display:flex;justify-content:space-between;">
      <span>COACHEDBYRUDHRA — Your Website Guide</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`,
  margin: { top: "17mm", bottom: "20mm", left: "16mm", right: "16mm" },
});

await browser.close();

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`Wrote ${OUT} (${kb} KB)`);
