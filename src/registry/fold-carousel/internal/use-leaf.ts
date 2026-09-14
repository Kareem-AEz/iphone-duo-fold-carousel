import { type MotionValue, useTransform } from "motion/react";

import type { Side } from "./fold-carousel.types";
import { HINGE_OVERLAP, panels } from "./panels.utils";
import { smoothstep } from "./smoothstep.utils";

/** Degrees a leaf turns, from flat on one half to flat on the other. */
export const LEAF_TURN = 180;

/**
 * Closest the far edge may get to the hinge. Exactly edge-on, the overhang's slope divides
 * by zero, and the browser drops an `Infinity` clip path and paints the face over the frame.
 */
const MIN_SPREAD = 1e-4;

type LeafOptions = {
  /** Perspective distance, in panel widths. */
  depth: number;
  /**
   * Whether the faces reach `HINGE_OVERLAP` past the hinge. Turn it off for a leaf whose
   * hinge edge another face already covers, or it leaves a one-pixel line on the other half.
   */
  overhang?: boolean;
};

/** A point on the hinge axis, in panel widths plus rem. */
type Edge = { at: number; rem: number };

/**
 * Clip paths and tilts for the two faces of a leaf turning on `rotateY`.
 *
 * The faces never rotate. Each is a flat layer clipped to the leaf's projected trapezoid, so
 * the slide is never foreshortened. The front shows from 0 to 90°, the back from 90 to 180°,
 * and each clip is empty while its face points away. Assumes the perspective origin sits on
 * the hinge.
 */
export function useLeaf(
  angle: MotionValue<number>,
  { depth, overhang = true }: LeafOptions,
) {
  // Perspective magnifies the turning leaf past the panel, so the layers are taller.
  const layerHeight = depth / (depth - 1);
  // The hinge edge is the one edge never magnified, so the screen's top lines up with it.
  const screenTop = (layerHeight - 1) / 2;

  /** One face's outline, with `hinge` and `hang` in that face's own box. */
  const outline = (deg: number, hinge: Edge, hang: Edge) => {
    const rad = (deg * Math.PI) / 180;
    const scale = depth / (depth - Math.sin(rad));
    // Negative past 90°, which swings the far edge across the hinge: that is the back face.
    const visible = Math.cos(rad) * scale;

    const farX = panels(hinge.at - visible, hinge.rem);
    const hangX = panels(hang.at, hang.rem);
    const farTop = (layerHeight - scale) / 2;

    // Carry the slanted edge along its own slope past the hinge, so the overhang widens the
    // trapezoid instead of tilting it. CSS caps it, since only CSS knows how rem compares.
    const slope = (screenTop - farTop) / Math.max(Math.abs(visible), MIN_SPREAD);
    const carry = `min(${panels(screenTop)}, ${(slope * HINGE_OVERLAP).toFixed(4)}rem)`;

    return `polygon(${farX} ${panels(farTop)}, ${hangX} calc(${panels(screenTop)} + ${carry}), ${hangX} calc(${panels(layerHeight - screenTop)} - ${carry}), ${farX} ${panels(layerHeight - farTop)})`;
  };

  // The front lies left of the hinge and hangs over its box's right edge. The back lies
  // right of it and hangs over its left.
  const front = {
    hinge: { at: 1, rem: 0 },
    hang: { at: 1, rem: overhang ? HINGE_OVERLAP : 0 },
  };
  const back = {
    hinge: { at: 0, rem: HINGE_OVERLAP },
    hang: { at: 0, rem: overhang ? 0 : HINGE_OVERLAP },
  };
  const frontSide: Side = "left";
  const backSide: Side = "right";

  const frontClip = useTransform(() =>
    outline(angle.get(), front.hinge, front.hang),
  );
  const backClip = useTransform(() =>
    outline(angle.get(), back.hinge, back.hang),
  );

  // 0 lying flat to 1 edge-on. The back's runs backwards so it lands at exactly 0, leaving
  // no shade or blur to give away the slide swap.
  const frontTilt = useTransform(() =>
    smoothstep(Math.abs(angle.get()), { from: 0, to: LEAF_TURN / 2 }),
  );
  const backTilt = useTransform(() =>
    smoothstep(Math.abs(angle.get()), { from: LEAF_TURN, to: LEAF_TURN / 2 }),
  );

  return {
    layerWidth: panels(1, HINGE_OVERLAP),
    layerInset: panels(-screenTop),
    screenTop: panels(screenTop),
    frontClip,
    backClip,
    frontTilt,
    backTilt,
    frontSide,
    backSide,
  };
}
