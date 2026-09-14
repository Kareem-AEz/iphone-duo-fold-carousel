import { createContext, type ReactNode, use } from "react";
import type { MotionValue } from "motion/react";

import type { Fold } from "./fold-carousel.types";
import type { useFoldEngine } from "./use-fold-engine";

type FoldCarouselContextValue = ReturnType<typeof useFoldEngine> & {
  slides: ReactNode[];
  /** The fold on screen, which trails the engine's target while React catches up. */
  fold: Fold;
  /** How far through `fold` the turn is, 0 to 1. */
  progress: MotionValue<number>;
};

export const FoldCarouselContext =
  createContext<FoldCarouselContextValue | null>(null);

/** The surrounding carousel's full state. Throws outside a `FoldCarousel`. */
export function useFoldCarouselContext() {
  const context = use(FoldCarouselContext);
  if (!context) {
    throw new Error("Fold carousel parts must be used inside <FoldCarousel>.");
  }

  return context;
}
