/*
 * Every length in the fold is written in panel widths. The stage sets `font-size` to one
 * panel, so `1em` is a panel anywhere inside it and the whole rig resizes from that one
 * property. Geometry never uses `rem`, which would stay put while the panel shrank. The
 * hinge overlap is the one exception.
 */

/**
 * How far each face reaches past the hinge, in rem. It covers the fractional pixel where
 * the halves meet, which would otherwise show as a dark hairline down the crease. Absolute,
 * because a device pixel does not shrink with the panel. `BODY_CLIP` trims by the same amount.
 */
export const HINGE_OVERLAP = 0.0625;

/**
 * A leaf body's clip: trimmed by the hinge overlap on every edge but the hinge. Face edges
 * are soft, so a body reaching them shows through as a hairline in the bezel colour.
 */
export const BODY_CLIP = `inset(${HINGE_OVERLAP}rem 0 ${HINGE_OVERLAP}rem ${HINGE_OVERLAP}rem)`;

/** Trims float noise, which lands in a clip path four times per point. */
function round(value: number) {
  return Number(value.toFixed(5));
}

/**
 * A CSS length of `width` panels plus `rem` rem. A string, because only CSS knows how `em`
 * and `rem` compare.
 */
export function panels(width: number, rem = 0) {
  if (!rem) return `${round(width)}em`;

  return `calc(${round(width)}em ${rem < 0 ? "-" : "+"} ${round(Math.abs(rem))}rem)`;
}
