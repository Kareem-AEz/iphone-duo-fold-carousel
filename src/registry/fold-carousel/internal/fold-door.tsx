import { motion, useTransform } from "motion/react";

import { DEFAULTS, DOOR } from "../config";
import type { FoldVariantProps } from "./fold-carousel.types";
import { FoldFace } from "./fold-face";
import { FoldStage } from "./fold-stage";
import { panels } from "./panels.utils";
import { SlideLayer } from "./slide-layer";
import { smoothstep } from "./smoothstep.utils";
import { LEAF_TURN, useLeaf } from "./use-leaf";

/**
 * The left half folds onto the still right half, while a second leaf swings the next slide's
 * left half in behind it. Between the two leaves you see through the gap.
 *
 * The outgoing leaf carries `outgoing`'s left half on its front and lands on the right half
 * carrying `incoming`'s right half on its back. At progress 1 the frame is `incoming` on both
 * halves, so the carousel can swap slides with nothing moving.
 */
export function FoldDoor({
  outgoing,
  incoming,
  progress,
  panelWidth,
  depth = DEFAULTS.depth,
  ...props
}: FoldVariantProps) {
  const outgoingAngle = useTransform(
    () => LEAF_TURN * smoothstep(progress.get()),
  );
  // Negative, so it swings in from behind the frame rather than reaching out of it.
  const incomingAngle = useTransform(
    () =>
      DOOR.incomingFrom * (1 - smoothstep(progress.get(), DOOR.incoming)),
  );

  const outgoingLeaf = useLeaf(outgoingAngle, { depth });
  // No overhang: the outgoing leaf's back already paints over this hinge edge. With one, a
  // pixel of the incoming slide would sit on the still half for the first part of the turn.
  const incomingLeaf = useLeaf(incomingAngle, { depth, overhang: false });
  // Hidden at rest. The faces' clipped edges are soft, and a black body with the same edges
  // shows through them as a dark hairline. It is only needed as bezel mid-turn.
  const bodyOpacity = useTransform(() => {
    const value = progress.get();
    return value > 0 && value < 1 ? 1 : 0;
  });

  const face = {
    layerWidth: outgoingLeaf.layerWidth,
    layerInset: outgoingLeaf.layerInset,
    screenTop: outgoingLeaf.screenTop,
  };
  const half = { width: panels(1), height: panels(1) };

  return (
    <FoldStage panelWidth={panelWidth} depth={depth} {...props}>
      {/* The incoming leaf's body, edge-on until it swings in. */}
      <motion.div
        style={{
          rotateY: incomingAngle,
          opacity: bodyOpacity,
          ...half,
          right: "50%",
        }}
        className="absolute origin-right bg-black"
      />

      {/* The outgoing leaf's body. Black, so the slivers the magnified fold reaches past the
          screen read as bezel. */}
      <motion.div
        style={{ rotateY: outgoingAngle, opacity: bodyOpacity, ...half }}
        className="origin-right bg-black"
      />

      {/* The still half. */}
      <div style={half} className="relative overflow-hidden bg-black">
        <SlideLayer
          slide={outgoing}
          left={panels(-1)}
          top={panels(0)}
          primary
        />
      </div>

      <FoldFace
        {...face}
        side={incomingLeaf.frontSide}
        slide={incoming}
        clipPath={incomingLeaf.frontClip}
        tilt={incomingLeaf.frontTilt}
      />

      <FoldFace
        {...face}
        side={outgoingLeaf.frontSide}
        slide={outgoing}
        clipPath={outgoingLeaf.frontClip}
        tilt={outgoingLeaf.frontTilt}
      />

      {/* Painted last, so the back comes down on top of the still half instead of meeting
          it edge to edge. */}
      <FoldFace
        {...face}
        side={outgoingLeaf.backSide}
        slide={incoming}
        clipPath={outgoingLeaf.backClip}
        tilt={outgoingLeaf.backTilt}
      />
    </FoldStage>
  );
}
