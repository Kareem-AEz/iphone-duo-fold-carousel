import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

import { wrap } from "./wrap.utils";

type FoldEngineOptions = {
  count: number;
  loop: boolean;
  duration: number;
  defaultIndex: number;
  onIndexChange?: (index: number) => void;
};

/** Without a loop, the first and last slides are hard stops. */
function limit(position: number, count: number, loop: boolean) {
  return loop ? position : Math.min(Math.max(position, 0), count - 1);
}

/**
 * Springs `position`, counted in slides, from one whole slide to another on command.
 *
 * Commands aim at a committed target rather than wherever the fold has got to, so five
 * quick presses land five slides on. `index` is the slide it is heading for, so it leads
 * the screen by up to one turn. Looping, `position` is folded back into its first lap each
 * time it lands. With reduced motion it cuts straight to the slide.
 */
export function useFoldEngine({
  count,
  loop,
  duration,
  defaultIndex,
  onIndexChange,
}: FoldEngineOptions) {
  const start = count > 0 ? wrap(defaultIndex, count) : 0;
  const position = useMotionValue(start);
  /** Where the last command sent it, which is not where the fold has got to yet. */
  const target = useRef(start);
  const [index, setIndex] = useState(start);
  const reduced = useReducedMotion();

  // In a ref, so a new callback each render is not a new `go`, which would re-aim a turn in
  // flight.
  const onIndexChangeRef = useRef(onIndexChange);
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  });

  /** Sends the fold to `to` and commits to it, without asking whether it should go. */
  const go = useCallback(
    (to: number) => {
      const previous = wrap(target.current, count);
      target.current = to;

      const nextIndex = wrap(to, count);
      setIndex(nextIndex);
      if (nextIndex !== previous) onIndexChangeRef.current?.(nextIndex);

      /** Back into the first lap, once the fold rests where the lap began. */
      const home = () => {
        const back = loop ? wrap(to, count) : to;
        if (back === to || target.current !== to) return;
        target.current = back;
        position.jump(back);
      };

      if (reduced) {
        position.jump(to);
        home();
        return;
      }

      // The spring keeps the speed the fold already had, so a press mid-turn redirects it
      // instead of restarting it.
      animate(position, to, {
        type: "spring",
        bounce: 0,
        duration,
        onComplete: home,
      });
    },
    [count, loop, duration, reduced, position],
  );

  const settle = useCallback(
    (to: number) => {
      if (!count) return;

      const limited = limit(to, count, loop);
      // A spring to where the fold is already headed still runs and interrupts the one
      // settling, so skip it.
      if (limited === target.current) return;
      go(limited);
    },
    [count, loop, go],
  );

  // A new duration re-aims a turn in flight at the same slide, with no jump.
  useEffect(() => {
    if (position.isAnimating()) go(target.current);
  }, [go, position]);

  // Switching the loop off can strand the fold past the last slide. Bring it back a lap,
  // then turn round for the nearest slide still in range.
  useEffect(() => {
    if (loop || !count) return;

    const last = count - 1;
    const inRange = (slide: number) => slide >= 0 && slide <= last;
    const now = position.get();
    if (inRange(now) && inRange(target.current)) return;

    const at = wrap(now, count);
    const aim = target.current + (at - now);
    if (at !== now) position.jump(at);
    go(inRange(aim) ? aim : Math.min(Math.round(at), last));
  }, [loop, count, go, position]);

  useEffect(() => () => position.stop(), [position]);

  const next = useCallback(() => settle(target.current + 1), [settle]);
  const prev = useCallback(() => settle(target.current - 1), [settle]);

  /** Folds to a slide by number, the short way round when looping. */
  const goTo = useCallback(
    (slide: number) => {
      if (!loop) {
        settle(slide);
        return;
      }

      let step = wrap(slide, count) - wrap(target.current, count);
      if (step > count / 2) step -= count;
      if (step < -count / 2) step += count;

      settle(target.current + step);
    },
    [count, loop, settle],
  );

  return {
    position,
    index,
    count,
    canPrev: loop || index > 0,
    canNext: loop || index < count - 1,
    prev,
    next,
    goTo,
  };
}
