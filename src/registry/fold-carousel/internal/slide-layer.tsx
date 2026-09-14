import type { ReactNode } from "react";

import { panels } from "./panels.utils";

type SlideLayerProps = {
  slide: ReactNode;
  /** Where the slide's left edge sits in the parent, as a CSS length. */
  left: string;
  /** Where the slide's top edge sits in the parent, as a CSS length. */
  top: string;
  /** The one copy screen readers hear. A fold paints each slide about ten times. */
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
      aria-hidden={primary ? undefined : true}
      style={{ left, top, width: panels(2), height: panels(1) }}
      // Cancels the stage's mirror for the slide itself, so only the geometry flips.
      className="absolute in-[[data-mirrored]]:-scale-x-100"
    >
      {/* `text-base` puts the font size back from a panel wide to `1rem`. Not `initial`,
          which is a fixed 16px and ignores a page that sizes its own root. The child is
          stretched to fill, so `img` and `next/image` land the same way. */}
      <div className="size-full text-base *:size-full *:object-cover">
        {slide}
      </div>
    </div>
  );
}
