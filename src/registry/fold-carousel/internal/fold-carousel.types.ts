import type { ComponentProps, ReactNode } from "react";
import type { MotionValue } from "motion/react";

/** What every variant takes, so the frame can swap one for another. */
export type FoldVariantProps = ComponentProps<"div"> & {
  /** The slide on screen, painted once across both halves. */
  outgoing: ReactNode;
  /** The slide coming in. By the end of the turn it fills the frame. */
  incoming: ReactNode;
  /**
   * 0 with `outgoing` flat, 1 once `incoming` fills the frame, pixel for pixel what 0 draws
   * with the slides advanced. That match is what lets the carousel swap slides unseen.
   */
  progress: MotionValue<number>;
  /** Width of one square panel, as any CSS length. Every other length scales from it. */
  panelWidth?: string;
  /** Perspective distance, in panel widths. Must stay above 1. */
  depth?: number;
  /** Folds the right half onto the left instead. Only the geometry mirrors, not the slide. */
  mirrored?: boolean;
};

/** Which side of the hinge a face sits on. Doubles as the CSS direction its ramps run in. */
export type Side = "left" | "right";

/**
 * The fold on screen. `direction` only changes when a fold starts from rest, so reversing a
 * turn in flight un-folds it instead of mirroring it.
 */
export type Fold = {
  /** The slide it is turning away from. Counts past either end and wraps underneath. */
  from: number;
  /** 1 folds the left half onto the right. -1 is the mirror. */
  direction: 1 | -1;
};
