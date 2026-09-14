/**
 * Measures hairlines and layout shifts on the fold carousel, at pixel densities where edges
 * land between device pixels.
 *
 * A hairline is an edge darker than both sides of it. For each outer edge of the frame and
 * the hinge, it reports how far the darkest pixel line on the edge falls below the lines a
 * few device pixels either side, averaged along the edge, in 0 to 255 luminance. A clean edge
 * reads close to 0. Each carousel is captured at rest, after next, after previous, and after
 * a turn interrupted by the opposite press. Every layout shift during those steps is listed.
 *
 * Measure a production build. Dev React is slower, and its overlay can shift things too.
 *
 *   npm run build && npx next start -p 3100
 *   npm run hairline -- --url http://localhost:3100
 *
 * Runs the installed Chrome headed, so the GPU rasterises edges the way a real screen does.
 * Captures land in the OS temp folder, and the path is printed at the end.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Locator, type Page } from "playwright-core";

const { values: opts } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3100" },
  },
});

/** The spring settles in 0.8s. A little over that lets each turn finish. */
const SETTLE_MS = 1200;
/** Far enough into a turn to be mid-fold, soon enough that the opposite press interrupts it. */
const INTERRUPT_MS = 250;
/** Device pixels between an edge and the lines it is compared with, past its soft pixel. */
const REFERENCE_GAP = 3;

/** Screens whose panel widths and densities put edges on fractional device pixels. */
const SCREENS = [
  { name: "phone-3x", width: 390, height: 844, scale: 3 },
  { name: "tablet-2x", width: 834, height: 1112, scale: 2 },
  { name: "laptop-1.25x", width: 1280, height: 900, scale: 1.25 },
  { name: "desktop-1x", width: 1470, height: 900, scale: 1 },
];

/** The carousels to measure, in page order. */
const CAROUSELS = ["door", "book"] as const;

type Rect = { x: number; y: number; width: number; height: number };
type Shift = { value: number; sources: string[] };
type LayoutShiftEntry = PerformanceEntry & {
  value: number;
  sources: { node: Node | null }[];
};

declare global {
  interface Window {
    __shifts: Shift[];
  }
}

/** Runs in the page before it loads. Collects layout shifts into `window.__shifts`. */
function recordShifts() {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    // Observed with `type: "layout-shift"`, so every entry is one.
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      window.__shifts.push({
        value: entry.value,
        sources: entry.sources.map((source) =>
          source.node instanceof Element
            ? `${source.node.localName}.${[...source.node.classList].join(".")}`
            : "(removed)",
        ),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
}

/**
 * Runs in the page, which can decode a PNG without a dependency. Returns the hairline depth
 * of each edge of `frame`, a rect in the capture's device pixels.
 */
async function measureEdges({
  png,
  frame,
  gap,
}: {
  png: string;
  frame: Rect;
  gap: number;
}) {
  const blob = await (await fetch(`data:image/png;base64,${png}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas context");
  context.drawImage(bitmap, 0, 0);
  const { data, width } = context.getImageData(0, 0, bitmap.width, bitmap.height);

  const luminance = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  };
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;

  // Along the middle 80% of an edge, so corners do not count twice.
  const rows = range(
    Math.ceil(frame.y + frame.height * 0.1),
    Math.floor(frame.y + frame.height * 0.9),
  );
  const columns = range(
    Math.ceil(frame.x + frame.width * 0.1),
    Math.floor(frame.x + frame.width * 0.9),
  );
  const column = (x: number) => mean(rows.map((y) => luminance(x, y)));
  const row = (y: number) => mean(columns.map((x) => luminance(x, y)));

  /** How far the darkest line straddling `at` falls below the lines `gap` away on each side. */
  const depth = (at: number, line: (i: number) => number) => {
    const edge = Math.min(...range(Math.floor(at) - 1, Math.ceil(at)).map(line));
    const before = mean(
      range(Math.floor(at) - gap - 2, Math.floor(at) - gap).map(line),
    );
    const after = mean(range(Math.ceil(at) + gap, Math.ceil(at) + gap + 2).map(line));
    return Math.round(Math.max(0, Math.min(before, after) - edge) * 10) / 10;
  };

  return {
    left: depth(frame.x, column),
    hinge: depth(frame.x + frame.width / 2, column),
    right: depth(frame.x + frame.width, column),
    top: depth(frame.y, row),
    bottom: depth(frame.y + frame.height, row),
  };
}

function press(carousel: Locator, button: "next" | "previous") {
  return carousel.locator(`[data-slot="fold-carousel-${button}"]`).click();
}

/** Run in order on one carousel, so each step starts where the last one left it. */
const STEPS = {
  rest: async () => {},
  next: async (carousel: Locator, page: Page) => {
    await press(carousel, "next");
    await page.waitForTimeout(SETTLE_MS);
  },
  // Back on the first slide, with the frame left mirrored.
  previous: async (carousel: Locator, page: Page) => {
    await press(carousel, "previous");
    await page.waitForTimeout(SETTLE_MS);
  },
  interrupt: async (carousel: Locator, page: Page) => {
    await press(carousel, "next");
    await page.waitForTimeout(INTERRUPT_MS);
    await press(carousel, "previous");
    await page.waitForTimeout(SETTLE_MS);
  },
} satisfies Record<string, (carousel: Locator, page: Page) => Promise<void>>;

/** Screenshots the frame with a margin of page around it, saves it, and measures its edges. */
async function capture(page: Page, frame: Locator, scale: number, file: string) {
  await frame.scrollIntoViewIfNeeded();
  const box = await frame.boundingBox();
  if (!box) throw new Error("The frame is not rendered");

  const margin = 8;
  const clip = {
    x: Math.floor(box.x) - margin,
    y: Math.floor(box.y) - margin,
    width: Math.ceil(box.width) + margin * 2,
    height: Math.ceil(box.height) + margin * 2,
  };
  const png = await page.screenshot({ clip });
  await writeFile(file, png);

  return page.evaluate(measureEdges, {
    png: png.toString("base64"),
    frame: {
      x: (box.x - clip.x) * scale,
      y: (box.y - clip.y) * scale,
      width: box.width * scale,
      height: box.height * scale,
    },
    gap: REFERENCE_GAP,
  });
}

const outDir = join(tmpdir(), "fold-hairline");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: false });
const results = [];
const shifts = [];

for (const screen of SCREENS) {
  const context = await browser.newContext({
    viewport: { width: screen.width, height: screen.height },
    deviceScaleFactor: screen.scale,
  });
  const page = await context.newPage();
  await page.addInitScript(recordShifts);
  await page.goto(opts.url, { waitUntil: "networkidle" });

  for (const [index, variant] of CAROUSELS.entries()) {
    const carousel = page.locator('[data-slot="fold-carousel"]').nth(index);
    const frame = carousel.locator('[data-slot="fold-carousel-frame"]');
    await frame.scrollIntoViewIfNeeded();
    await frame
      .locator("img")
      .evaluateAll((images) =>
        Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
      );

    for (const [step, act] of Object.entries(STEPS)) {
      await page.evaluate(() => {
        window.__shifts = [];
      });
      await act(carousel, page);

      const where = `${screen.name}-${variant}-${step}`;
      const edges = await capture(
        page,
        frame,
        screen.scale,
        join(outDir, `${where}.png`),
      );
      const stepShifts = await page.evaluate(() => window.__shifts);

      results.push({ screen: screen.name, variant, step, ...edges, shifts: stepShifts.length });
      shifts.push(...stepShifts.map((shift) => ({ where, ...shift })));
    }
  }

  await context.close();
}

await browser.close();

console.log("Hairline depth per edge, 0 to 255. Close to 0 is clean.");
console.table(results);
if (shifts.length) console.table(shifts);
else console.log("No layout shifts.");
console.log(`Captures in ${outDir}`);
