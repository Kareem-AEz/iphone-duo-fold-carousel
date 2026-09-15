import type { Slide } from "./fold-carousel.types";
import { panels } from "./panels.utils";

type SlideLayerProps = {
  slide: Slide;
  /** Where the slide's left edge sits in the parent, as a CSS length. */
  left: string;
  /** Where the slide's top edge sits in the parent, as a CSS length. */
  top: string;
  /**
   * The one copy screen readers and Tab can reach. A fold paints each slide 10 to 18 times,
   * and the rest are `inert`.
   */
  primary?: boolean;
};

/**
 * One copy of a slide, two panels wide, so the hinge cuts the slide instead of restarting
 * it. Shift it with `left` to pick which half shows through the parent.
 */
export function SlideLayer({
  slide,
  left,
  top,
  primary = false,
}: SlideLayerProps) {
  return (
    <div
      inert={!primary}
      style={{ left, top, width: panels(2), height: panels(1) }}
      // Cancels the stage's mirror for the slide itself, so only the geometry flips.
      className="absolute in-[[data-mirrored]]:-scale-x-100"
    >
      {/* `text-base` puts the font size back from a panel wide to `1rem`. Not `initial`,
          which is a fixed 16px and ignores a page that sizes its own root. The child is
          stretched to fill, so `img` and `next/image` land the same way. Until the slide is
          ready, the copy is solid bezel and the slide is invisible but still loading. Never
          both: a background under an image shows through the clipped edges as a line, and
          Chrome paints an image's own background until it has fully loaded. */}
      <div
        data-slide-index={slide.index}
        data-ready={slide.ready || undefined}
        className="size-full text-base *:size-full *:object-cover not-data-ready:bg-(--fold-bezel) not-data-ready:*:opacity-0"
      >
        {slide.content}
      </div>
    </div>
  );
}
