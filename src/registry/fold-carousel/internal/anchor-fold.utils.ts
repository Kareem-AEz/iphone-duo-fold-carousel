import type { Fold } from "./fold-carousel.types";

/**
 * How near a slide counts as at rest, in slides. A spring lands a hair short of its target,
 * and without this slack, pushing back on a finished fold would un-finish it instead of
 * mirroring it. Half a degree of the 180° turn: invisible, and far above float error.
 */
const REST = 0.5 / 180;

/**
 * The fold on screen once `position` has been reached, in slides.
 *
 * Returns `fold` itself while the turn is still inside it, so callers can skip the update.
 * Otherwise it re-anchors on the slide the turn is nearest. Pushing back past where the fold
 * started is the only thing that flips `direction`.
 */
export function anchorFold(fold: Fold, position: number): Fold {
  const travelled = fold.direction * (position - fold.from);
  if (travelled >= -REST && travelled < 1 - REST) return fold;

  let direction = fold.direction;
  if (travelled < 0) direction = fold.direction === 1 ? -1 : 1;

  // At rest, anchor on the slide it landed on. Still moving, anchor behind it, so the fold
  // in progress is the one described.
  const nearest = Math.round(position);
  if (Math.abs(position - nearest) < REST) return { from: nearest, direction };

  return {
    from: direction > 0 ? Math.floor(position) : Math.ceil(position),
    direction,
  };
}
