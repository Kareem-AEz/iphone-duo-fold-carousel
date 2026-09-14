import { BLUR, SHADE } from "../config";

/*
 * The ramps a turning face is drawn with, ported from the reference shader:
 *   radius = 72 * motion * pow(edge, 1.35)
 *   darken = min(1, 2 * motion * pow(clamp((edge - 0.2) / 0.8), 1.35))
 * `edge` runs from 0 at the hinge to 1 at the panel's outer edge. Both are written for a
 * fully turned face, and the face's tilt scales them.
 */

/** How dark a fully turned face is at `edge`. */
export function shadeAlpha(edge: number) {
  const ramp = Math.max(0, (edge - SHADE.deadZone) / (1 - SHADE.deadZone));
  return Math.min(1, SHADE.gain * ramp ** SHADE.curve);
}

/**
 * Draws the shade for a face `tilt` of the way turned, using only opacity and a horizontal
 * stretch.
 *
 * The shader scales before it clamps. Fading alone scales after, which bakes the clamp's
 * corner in and shows as a dark line down the face. Stretching by `tilt ** (-1 / curve)`
 * applies the scale first, exactly. Below `1 / gain` the clamp cannot bind, so opacity
 * takes over and the stretch stays bounded.
 */
export function shadeTurn(tilt: number) {
  const turn = Math.max(tilt, 1 / SHADE.gain);

  return { opacity: tilt / turn, stretch: turn ** (-1 / SHADE.curve) };
}

/**
 * One blurred copy per step: a fixed radius, and a band `[from, to]` that means two things.
 * Across the panel it is where the copy fades in. Across the tilt it is when.
 *
 * Fixed radii are rasterised once, so a turn only changes opacity. The bands tile, so only
 * one copy is ever partway in.
 */
export const BLUR_LAYERS = Array.from({ length: BLUR.layers }, (_, index) => {
  const from = index / BLUR.layers;
  const to = (index + 1) / BLUR.layers;

  return { from, to, radius: BLUR.maxRadius * to ** BLUR.curve };
});
