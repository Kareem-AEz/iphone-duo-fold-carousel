/**
 * Captures the share images from the real fold, frozen mid-turn on `/share-images`.
 *
 *   npm run build && npx next start -p 3100
 *   npm run share-images -- --url http://localhost:3100
 *
 * Writes the OG image, which Next picks up from `src/app/`, and the README banner. Rerun
 * after changing the fold or the demo photos.
 */
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { chromium } from "playwright-core";

const { values: opts } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3100" },
  },
});

const SHOTS = [
  { id: "og", file: "src/app/opengraph-image.png", scale: 1, transparent: false },
  { id: "banner", file: ".github/banner.png", scale: 2, transparent: true },
];

// Headed, like `hairline.mts`: a hidden tab gets no animation frames, so nothing hydrates.
const browser = await chromium.launch({ channel: "chrome", headless: false });

for (const shot of SHOTS) {
  // Tall enough that both sections sit in view, so no image waits on lazy loading.
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1200 },
    deviceScaleFactor: shot.scale,
  });
  const page = await context.newPage();
  await page.goto(`${opts.url}/share-images`, { waitUntil: "networkidle" });

  const section = page.locator(`#${shot.id}`);
  await section.evaluate((element) =>
    Promise.all([
      document.fonts.ready,
      ...[...element.querySelectorAll("img")].map((img) => img.decode()),
    ]),
  );

  await writeFile(
    shot.file,
    await section.screenshot({ omitBackground: shot.transparent }),
  );
  console.log(shot.file);
  await context.close();
}

await browser.close();
