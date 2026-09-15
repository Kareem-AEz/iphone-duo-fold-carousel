/*
 * Values that are safe to tweak. Everything in `internal/` is geometry the fold's
 * pixel-exact slide swap depends on.
 */

/** Used when `FoldCarousel` or `FoldCarouselFrame` is given no value. */
export const DEFAULTS = {
  /** Width of one square panel, as any CSS length. The frame is two panels wide. */
  panelWidth: "min(23rem, 42vw)",
  /** Perspective distance, in panel widths. Lower is more dramatic. Must stay above 1. */
  depth: 88 / 23,
  /** Seconds a turn takes to settle onto a slide. */
  duration: 0.8,
  /** Whether the last slide folds on to the first. */
  loop: true,
  /**
   * Any CSS colour. Shows on a leaf's edge mid-turn, and in place of a slide until its images
   * have loaded.
   */
  bezelColor: "black",
};

/** How the `door` variant staggers its two leaves. */
export const DOOR = {
  /**
   * Where the incoming leaf starts, in degrees. Keep it a few degrees short of -90. Exactly
   * edge-on, browsers rasterise it inconsistently and the clip math divides by zero.
   */
  incomingFrom: -85,
  /**
   * The slice of the turn the incoming leaf moves over. A `bias` below 1 makes it lead and
   * settle slowly, above 1 makes it lag and then rush. Moving at a different rate from the
   * outgoing leaf is what makes the two read as separate depths.
   */
  incoming: { from: 0.15, to: 0.9, bias: 0.8 },
};

/** The progressive blur on a turning face. */
export const BLUR = {
  /** Radius at the panel's outer edge, in panel widths. */
  maxRadius: 0.09,
  /** Bends the ramp so the blur stays tight near the hinge. */
  curve: 1.35,
  /**
   * Blurred copies per face. More blends more smoothly and holds more textures. The radii
   * are fixed, so it never adds work per frame.
   */
  layers: 8,
};

/** The darkening on a turning face. */
export const SHADE = {
  /** Share of the panel next to the hinge that stays unshaded. */
  deadZone: 0.2,
  /** Bends the ramp so it stays light near the hinge and falls off fast after. */
  curve: 1.35,
  /** Pushes the far side to full black before it reaches the outer edge. */
  gain: 2,
};
