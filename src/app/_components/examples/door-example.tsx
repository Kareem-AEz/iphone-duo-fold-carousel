import type { ReactNode } from "react";

import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/registry/fold-carousel/fold-carousel";

export function DoorExample({ slides }: { slides: ReactNode[] }) {
  return (
    <FoldCarousel
      slides={slides}
      aria-label="Landscapes"
      className="flex flex-col items-center gap-20"
    >
      <FoldCarouselFrame panelWidth="min(20rem, 42vw)" />
      <div className="flex gap-2">
        <FoldCarouselPrevious />
        <FoldCarouselNext />
      </div>
    </FoldCarousel>
  );
}
