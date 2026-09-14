"use client";

import type { ReactNode } from "react";

import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/registry/fold-carousel/fold-carousel";
import { useFoldCarousel } from "@/registry/fold-carousel/use-fold-carousel";

export function ControlsExample({ slides }: { slides: ReactNode[] }) {
  return (
    <FoldCarousel
      slides={slides}
      loop={false}
      aria-label="Landscapes"
      className="flex flex-col items-center gap-14"
    >
      <FoldCarouselFrame panelWidth="min(14rem, 38vw)" />
      <div className="flex items-center gap-2">
        <FoldCarouselPrevious size="icon-sm" />
        <Dots />
        <FoldCarouselNext size="icon-sm" />
      </div>
    </FoldCarousel>
  );
}

function Dots() {
  const { index, count, goTo } = useFoldCarousel();

  return (
    <div className="flex">
      {Array.from({ length: count }, (_, slide) => (
        <button
          key={slide}
          type="button"
          aria-label={`Slide ${slide + 1} of ${count}`}
          aria-current={slide === index}
          onClick={() => goTo(slide)}
          className="group focus-visible:ring-ring/50 grid size-8 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-3"
        >
          <span className="bg-foreground/20 group-hover:bg-foreground/40 group-aria-current:bg-foreground size-1.5 rounded-full transition-colors" />
        </button>
      ))}
    </div>
  );
}
