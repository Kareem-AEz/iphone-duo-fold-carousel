import type { ReactNode } from "react";

import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/registry/fold-carousel/fold-carousel";

export function BookExample({ slides }: { slides: ReactNode[] }) {
  return (
    <FoldCarousel
      slides={slides}
      aria-label="Landscapes"
      className="flex flex-col items-center gap-14"
    >
      <FoldCarouselFrame variant="book" panelWidth="min(14rem, 38vw)" />
      <div className="flex gap-2">
        <FoldCarouselPrevious />
        <FoldCarouselNext />
      </div>
    </FoldCarousel>
  );
}
