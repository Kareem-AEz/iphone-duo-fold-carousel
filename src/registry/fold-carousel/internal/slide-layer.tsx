import type { ReactNode } from "react";

import { panels } from "./panels.utils";

type SlideLayerProps = {
  slide: ReactNode;
  /** Where the slide's left edge sits in the parent, as a CSS length. */
  left: string;
  /** Where the slide's top edge sits in the parent, as a CSS length. */
  top: string;
  /**
   * The one copy screen readers and Tab can reach. A fold paints each slide 10 to 18 times,
   * and the rest are `inert`.
   */
  primary?: boolean;
  /**
   * Paints the bezel behind the slide's left half only. For a left face whose reach past the
   * hinge lies on the still half, which carries the same slide and its own bezel. There, this
   * copy's bezel shows as a line on the frame a photo first paints.
   */
  bezelStopsAtHinge?: boolean;
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
  bezelStopsAtHinge = false,
}: SlideLayerProps) {
  // The layer flips the slide back when mirrored, so its left half is the image's right half.
  const bezel = bezelStopsAtHinge
    ? "not-in-[[data-mirrored]]:*:bg-[linear-gradient(to_right,var(--fold-bezel)_50%,transparent_50%)] in-[[data-mirrored]]:*:bg-[linear-gradient(to_left,var(--fold-bezel)_50%,transparent_50%)]"
    : "*:bg-(--fold-bezel)";

  return (
    <div
      inert={!primary}
      style={{ left, top, width: panels(2), height: panels(1) }}
      // Cancels the stage's mirror for the slide itself, so only the geometry flips.
      className="absolute in-[[data-mirrored]]:-scale-x-100"
    >
      {/* `text-base` puts the font size back from a panel wide to `1rem`. Not `initial`,
          which is a fixed 16px and ignores a page that sizes its own root. The child is
          stretched to fill, so `img` and `next/image` land the same way. Its own background
          is the bezel, which the photo hides once it paints. On a layer or a wrapper, the
          same colour shows through the layer's edge pixel as a line. */}      <div
        className={`size-full text-base *:size-full *:object-cover ${bezel}`}
      >
        {slide}
      </div>
    </div>
  );
}
