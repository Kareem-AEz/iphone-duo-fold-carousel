"use client";

import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

import { DEFAULTS } from "./config";
import { anchorFold } from "./internal/anchor-fold.utils";
import { FoldBook } from "./internal/fold-book";
import {
  FoldCarouselContext,
  useFoldCarouselContext,
} from "./internal/fold-carousel.context";
import type { Fold, FoldVariantProps } from "./internal/fold-carousel.types";
import { FoldDoor } from "./internal/fold-door";
import { useFoldEngine } from "./internal/use-fold-engine";
import { wrap } from "./internal/wrap.utils";
import { useFoldCarousel } from "./use-fold-carousel";

const VARIANTS = {
  door: FoldDoor,
  book: FoldBook,
} satisfies Record<string, (props: FoldVariantProps) => ReactNode>;

export type FoldCarouselProps = ComponentProps<"div"> & {
  /**
   * One slide per item, each painted across both halves of the frame. Anything that fills a
   * box works, like `img` or `next/image` with `fill`.
   */
  slides: ReactNode[];
  /** Whether the last slide folds on to the first. */
  loop?: boolean;
  /** Seconds a turn takes to settle onto a slide. */
  duration?: number;
  /** The slide shown first. */
  defaultIndex?: number;
  /** Called with the slide a turn is heading for, as soon as the turn starts. */
  onIndexChange?: (index: number) => void;
};

/**
 * A carousel that folds from one slide to the next like a two-panel phone. It holds the
 * state, so put a `FoldCarouselFrame` and any controls inside it. Arrow keys change slides
 * while focus is inside.
 */
export function FoldCarousel({
  slides,
  loop = DEFAULTS.loop,
  duration = DEFAULTS.duration,
  defaultIndex = 0,
  onIndexChange,
  className,
  children,
  ...props
}: FoldCarouselProps) {
  const engine = useFoldEngine({
    count: slides.length,
    loop,
    duration,
    defaultIndex,
    onIndexChange,
  });
  const [fold, setFold] = useState<Fold>({
    from: engine.index,
    direction: 1,
  });

  // The fold this render shows, published for Motion. Measuring progress against it instead
  // of the raw position keeps the leaves from drawing a slide React has not mounted yet.
  const from = useMotionValue(fold.from);
  const direction = useMotionValue<number>(fold.direction);
  from.set(fold.from);
  direction.set(fold.direction);

  // Can sit just outside 0 to 1 while React catches up. Variants clamp it, and the clamp
  // lands on the same picture the other side of the swap draws.
  const progress = useTransform(
    () => direction.get() * (engine.position.get() - from.get()),
  );

  // Do not force React into step with `flushSync` here. Committing inside a motion value's
  // change event skips every subscriber after this one.
  useMotionValueEvent(engine.position, "change", (position) => {
    const anchored = anchorFold(fold, position);
    if (anchored !== fold) setFold(anchored);
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      engine.prev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      engine.next();
    }
  };

  return (
    <FoldCarouselContext value={{ ...engine, slides, fold, progress }}>
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="fold-carousel"
        // Focusable by click but not by Tab, so arrow keys work after clicking a slide.
        // Without `outline-none` Chrome rings the whole carousel on the first key press, and
        // the fold is feedback enough.
        tabIndex={-1}
        onKeyDownCapture={handleKeyDown}
        className={cn("outline-none", className)}
        {...props}
      >
        {children}
        {slides.length > 0 && (
          <div aria-live="polite" aria-atomic className="sr-only">
            Slide {engine.index + 1} of {slides.length}
          </div>
        )}
      </div>
    </FoldCarouselContext>
  );
}

export type FoldCarouselFrameProps = Omit<
  FoldVariantProps,
  "outgoing" | "incoming" | "progress" | "mirrored"
> & {
  /** `door` swings the next slide in behind the current one. `book` lays it underneath. */
  variant?: keyof typeof VARIANTS;
};

/** The folding picture. Reads its slides and progress from the surrounding `FoldCarousel`. */
export function FoldCarouselFrame({
  variant = "door",
  ...props
}: FoldCarouselFrameProps) {
  const { slides, fold, progress } = useFoldCarouselContext();
  if (!slides.length) return null;

  const at = (slide: number) => slides[wrap(slide, slides.length)];
  const Variant = VARIANTS[variant];

  return (
    <Variant
      role="group"
      aria-roledescription="slide"
      aria-label={`${wrap(fold.from, slides.length) + 1} of ${slides.length}`}
      data-slot="fold-carousel-frame"
      {...props}
      progress={progress}
      outgoing={at(fold.from)}
      incoming={at(fold.from + fold.direction)}
      mirrored={fold.direction < 0}
    />
  );
}

/**
 * Folds back one slide. Takes every `Button` prop, and children replace the icon. At the
 * first slide without a loop it stays focusable and does nothing.
 */
export function FoldCarouselPrevious({
  variant = "outline",
  size = "icon",
  className,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { canPrev, prev } = useFoldCarousel();

  return (
    <Button
      data-slot="fold-carousel-previous"
      aria-label="Previous slide"
      variant={variant}
      size={size}
      disabled={!canPrev}
      focusableWhenDisabled
      // The pseudo-element widens the tap target past the visible button.
      className={cn(
        "relative after:absolute after:-inset-1.5 data-disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        prev();
      }}
      {...props}
    >
      {children ?? <ChevronLeftIcon />}
    </Button>
  );
}

/**
 * Folds on one slide. Takes every `Button` prop, and children replace the icon. At the last
 * slide without a loop it stays focusable and does nothing.
 */
export function FoldCarouselNext({
  variant = "outline",
  size = "icon",
  className,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { canNext, next } = useFoldCarousel();

  return (
    <Button
      data-slot="fold-carousel-next"
      aria-label="Next slide"
      variant={variant}
      size={size}
      disabled={!canNext}
      focusableWhenDisabled
      // The pseudo-element widens the tap target past the visible button.
      className={cn(
        "relative after:absolute after:-inset-1.5 data-disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        next();
      }}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </Button>
  );
}
