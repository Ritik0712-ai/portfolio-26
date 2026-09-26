// Prints the ATS-friendly résumé to public/resume.pdf from data/resume.ts —
// the same data the interactive résumé on the site renders, so the two
// never drift apart.
//
//   npm run resume:pdf
//
// Uses your installed Google Chrome. Set CHROME_PATH to use another
// Chromium-based browser binary.
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { resume } from '../data/resume.ts';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const short = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const link = (url, text = short(url)) => `<a href="${esc(url)}">${esc(text)}</a>`;
const bullets = (points) => `<ul>${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(resume.name)} — Résumé</title>
<style>
  @page { size: A4; margin: 10mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif; font-size: 9.4pt; line-height: 1.33; color: #1f2937; }
  a { color: #1d4ed8; text-decoration: none; }
  header { text-align: center; margin-bottom: 4pt; }
  h1 { margin: 0; font-size: 21pt; letter-spacing: 0.04em; color: #111827; }
  .headline { margin: 2pt 0 3pt; font-size: 10.5pt; color: #374151; }
  .contact { font-size: 9pt; color: #374151; }
  .contact span + span::before { content: '|'; margin: 0 6pt; color: #9ca3af; }
  h2 { margin: 7pt 0 3pt; padding-bottom: 2pt; border-bottom: 1.2pt solid #1d4ed8; font-size: 10.5pt; letter-spacing: 0.08em; text-transform: uppercase; color: #1d4ed8; }
  .row { display: flex; justify-content: space-between; gap: 12pt; }
  .row .when { flex-shrink: 0; color: #4b5563; }
  .title { font-weight: bold; color: #111827; }
  .muted { color: #4b5563; }
  .item { margin-bottom: 4pt; }
  .stack { font-size: 8.8pt; color: #4b5563; margin-top: 1pt; }
  ul { margin: 2pt 0 0; padding-left: 13pt; }
  li { margin: 1pt 0; }
  .skills div { margin: 1pt 0; }
  p { margin: 0; }
</style>
</head>
<body>
  <header>
    <h1>${esc(resume.name.toUpperCase())}</h1>
    <p class="headline">${esc(resume.title)} | ${esc(resume.education.degree.replace('B.Tech in Computer Science & Engineering', 'B.Tech CSE'))}, VIT Bhopal | ${esc(resume.location)}</p>
    <p class="contact">
      <span>${link(`mailto:${resume.email}`, resume.email)}</span>
      <span>${link(resume.website)}</span>
      <span>${link(resume.linkedin, 'LinkedIn')}</span>
      <span>${link(resume.github)}</span>
      <span>${link(resume.leetcode, 'LeetCode')}</span>
    </p>
  </header>

  <h2>Summary</h2>
  <p>${esc(resume.about)}</p>

  <h2>Education</h2>
  <div class="row"><p><span class="title">${esc(resume.education.school)}</span> — ${esc(resume.education.degree)}</p><span class="when">${esc(resume.education.period)}</span></div>
  <p class="muted">${esc(resume.education.year)} · ${esc(resume.education.graduation)}</p>
  <p><b>Relevant coursework:</b> ${esc(resume.coursework.join(', '))}</p>

  <h2>Experience</h2>
  ${resume.experience
    .map(
      (x) => `<div class="item">
    <div class="row"><p><span class="title">${esc(x.role)}</span> — ${esc(x.org)}</p><span class="when">${esc(x.period)}</span></div>
    ${bullets(x.points)}
  </div>`,
    )
    .join('')}

  <h2>Projects</h2>
  ${resume.projects
    .map(
      (p) => `<div class="item">
    <div class="row"><p><span class="title">${esc(p.name)}</span> — ${esc(p.tagline)}</p><span class="when">${link(p.demo, 'Live')} | ${link(p.repo, 'Code')}</span></div>
    <p class="stack"><b>Stack:</b> ${esc(p.stack.join(', '))}</p>
    ${bullets(p.points)}
  </div>`,
    )
    .join('')}

  <h2>Technical Skills</h2>
  <div class="skills">
    ${resume.skills.map((s) => `<div><b>${esc(s.label)}:</b> ${esc(s.items.join(', '))}</div>`).join('')}
  </div>

  <h2>Certifications</h2>
  ${resume.certifications
    .map((c) => `<div class="row"><p><span class="title">${link(c.url, c.title)}</span> — ${esc(c.issuer)}</p><span class="when">${esc(c.date)}</span></div>`)
    .join('')}

</body>
</html>`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  writeFileSync('public/resume.pdf', pdf);
  console.log(`Wrote public/resume.pdf (${Math.round(pdf.length / 1024)} KB)`);
} finally {
  await browser.close();
}
