import { useFoldCarouselContext } from "./internal/fold-carousel.context";

/**
 * Reads the surrounding `FoldCarousel`, for building your own controls like dots or a
 * counter. `index` is the slide the carousel is heading for, so it updates the moment a turn
 * starts.
 */
export function useFoldCarousel() {
  const { index, count, canPrev, canNext, prev, next, goTo } =
    useFoldCarouselContext();

  return { index, count, canPrev, canNext, prev, next, goTo };
}
