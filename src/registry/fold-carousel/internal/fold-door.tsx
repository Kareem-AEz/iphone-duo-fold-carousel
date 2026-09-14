import { motion, useTransform } from "motion/react";

import { DEFAULTS, DOOR } from "../config";
import type { FoldVariantProps } from "./fold-carousel.types";
import { FoldFace } from "./fold-face";
import { FoldStage } from "./fold-stage";
import { BODY_CLIP, panels } from "./panels.utils";
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
  // Negative, so it swings in from behind the frame rather than reaching out of it. Back there
  // perspective only shrinks it, so its face always covers it and it needs no body.
  const incomingAngle = useTransform(
    () =>
      DOOR.incomingFrom * (1 - smoothstep(progress.get(), DOOR.incoming)),
  );

  const outgoingLeaf = useLeaf(outgoingAngle, { depth });
  // No overhang: the outgoing leaf's back already paints over this hinge edge. With one, a
  // pixel of the incoming slide would sit on the still half for the first part of the turn.
  const incomingLeaf = useLeaf(incomingAngle, { depth, overhang: false });

  const face = {
    layerWidth: outgoingLeaf.layerWidth,
    layerInset: outgoingLeaf.layerInset,
    screenTop: outgoingLeaf.screenTop,
  };
  const half = { width: panels(1), height: panels(1) };

  return (
    <FoldStage panelWidth={panelWidth} depth={depth} {...props}>
      {/* The outgoing leaf's body, in the bezel colour, so the slivers the magnified fold
          reaches past the screen read as bezel. */}
      <motion.div
        style={{ rotateY: outgoingAngle, clipPath: BODY_CLIP, ...half }}
        className="origin-right bg-(--fold-bezel)"
      />

      {/* The still half. */}
      <div style={half} className="relative overflow-hidden">
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
        overhangsStillHalf
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
