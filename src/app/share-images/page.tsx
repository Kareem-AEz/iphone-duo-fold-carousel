import type { Metadata } from "next";

import { DEMO_SLIDES } from "@/app/_components/examples/demo-slides";
import { FrozenFold } from "@/app/share-images/_components/frozen-fold";

export const metadata: Metadata = {
  title: "Share images",
  robots: { index: false },
};

/**
 * The leaf nearly edge-on, so its shade is a thin band and the next slide shows. Earlier in
 * the turn, the leaf still covers the next slide under a dark shade.
 */
const PROGRESS = 0.45;

const [outgoing, incoming] = DEMO_SLIDES;

/**
 * The share images, drawn by the real component at their exact pixel sizes.
 * `scripts/share-images.mts` screenshots each section into a PNG.
 */
export default function ShareImagesPage() {
  return (
    <main className="flex flex-col items-start">
      {/* The banner is transparent, so the page drops its white. */}
      <style>{"body { background: transparent; }"}</style>

      <section
        id="og"
        className="bg-background flex h-[630px] w-[1200px] items-center justify-between px-20"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-[64px] leading-none font-medium tracking-tight">
            Fold Carousel
          </h1>
          <p className="text-muted-foreground max-w-[420px] text-[26px] leading-snug text-balance">
            A carousel that folds like a two-panel phone.
          </p>
        </div>
        <FrozenFold
          progress={PROGRESS}
          outgoing={outgoing}
          incoming={incoming}
          panelWidth="270px"
        />
      </section>

      <section
        id="banner"
        className="flex h-[400px] w-[1280px] items-center justify-center"
      >
        <FrozenFold
          progress={PROGRESS}
          outgoing={outgoing}
          incoming={incoming}
          panelWidth="240px"
        />
      </section>
    </main>
  );
}
