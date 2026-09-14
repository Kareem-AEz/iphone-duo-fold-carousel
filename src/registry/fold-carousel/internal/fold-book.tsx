import { motion, useTransform } from "motion/react";

import { DEFAULTS } from "../config";
import type { FoldVariantProps } from "./fold-carousel.types";
import { FoldFace } from "./fold-face";
import { FoldStage } from "./fold-stage";
import { HINGE_OVERLAP, panels } from "./panels.utils";
import { SlideLayer } from "./slide-layer";
import { smoothstep } from "./smoothstep.utils";
import { LEAF_TURN, useLeaf } from "./use-leaf";

/**
 * The left half folds onto the right like a page, uncovering the next slide lying
 * underneath.
 *
 * One leaf carries `outgoing`'s left half on its front and lands on the right half carrying
 * `incoming`'s right half on its back. At progress 1 the frame is `incoming` on both halves,
 * so the carousel can swap slides with nothing moving.
 */
export function FoldBook({
  outgoing,
  incoming,
  progress,
  panelWidth,
  depth = DEFAULTS.depth,
  ...props
}: FoldVariantProps) {
  const angle = useTransform(() => LEAF_TURN * smoothstep(progress.get()));
  const leaf = useLeaf(angle, { depth });
  // Hidden at rest. The faces' clipped edges are soft, and a black body with the same edges
  // shows through them as a dark hairline. It is only needed as bezel mid-turn.
  const bodyOpacity = useTransform(() => {
    const value = progress.get();
    return value > 0 && value < 1 ? 1 : 0;
  });

  const face = {
    layerWidth: leaf.layerWidth,
    layerInset: leaf.layerInset,
    screenTop: leaf.screenTop,
  };
  const half = { width: panels(1), height: panels(1) };

  return (
    <FoldStage panelWidth={panelWidth} depth={depth} {...props}>
      {/* The incoming slide's left half, lying still under the fold. It is not turning, so
          it needs no shade or blur. */}
      <div
        style={{
          width: leaf.layerWidth,
          top: leaf.layerInset,
          bottom: leaf.layerInset,
          right: `calc(50% - ${HINGE_OVERLAP}rem)`,
        }}
        className="absolute overflow-hidden"
      >
        <SlideLayer slide={incoming} left={panels(0)} top={leaf.screenTop} />
      </div>

      {/* The leaf's body. Black, so the slivers the magnified fold reaches past the screen
          read as bezel. */}
      <motion.div
        style={{ rotateY: angle, opacity: bodyOpacity, ...half }}
        className="origin-right bg-black"
      />

      <FoldFace
        {...face}
        side={leaf.frontSide}
        slide={outgoing}
        clipPath={leaf.frontClip}
        tilt={leaf.frontTilt}
      />

      {/* The still half. Painted after the leaf's front so it covers that edge instead of
          meeting it on a fractional pixel. */}
      <div style={half} className="relative overflow-hidden bg-black">
        <SlideLayer
          slide={outgoing}
          left={panels(-1)}
          top={panels(0)}
          primary
        />
      </div>

      {/* Painted last, so the back comes down on top of the still half. */}
      <FoldFace
        {...face}
        side={leaf.backSide}
        slide={incoming}
        clipPath={leaf.backClip}
        tilt={leaf.backTilt}
      />
    </FoldStage>
  );
}
