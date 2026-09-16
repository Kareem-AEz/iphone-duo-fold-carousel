"use client";

import { type ReactNode, useRef, useState } from "react";
import {
  animate,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

import { FoldHud } from "@/app/_components/how-it-works/fold-hud";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FoldBook } from "@/registry/fold-carousel/internal/fold-book";
import { FoldDoor } from "@/registry/fold-carousel/internal/fold-door";
import { useReadySlides } from "@/registry/fold-carousel/internal/use-ready-slides";

const VARIANTS = { door: FoldDoor, book: FoldBook };
type Variant = keyof typeof VARIANTS;

/**
 * The pick is a raised pill on a muted track. The shadcn default fills the pick muted
 * instead, which reads as disabled.
 */
const VARIANT_ITEM =
  "text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground rounded-md hover:bg-transparent aria-pressed:shadow-xs";

/** Slow enough to follow the instruments while it plays. */
const PLAY_SPRING = { type: "spring", bounce: 0, duration: 1.6 } as const;

/**
 * One fold between the first two slides, driven by hand, with the HUD reading the same
 * progress. It renders the component's internal variants directly, like `/share-images`, so
 * the public API never has to expose a scrub.
 */
export function HowItWorks({ slides }: { slides: ReactNode[] }) {
  const [variant, setVariant] = useState<Variant>("door");
  const progress = useMotionValue(0);
  const stage = useRef<HTMLDivElement>(null);
  const ready = useReadySlides(stage, 0, 1);

  const Fold = VARIANTS[variant];

  return (
    <div className="rounded-xl border">
      {/* Hidden from screen readers: the photos are the hero's, and the slider below
          carries the state. The padding clears the leaf, which reaches past the frame. */}
      <div aria-hidden className="flex justify-center px-4 py-14">
        <Fold
          ref={stage}
          progress={progress}
          outgoing={{ content: slides[0], index: 0, ready: ready.has(0) }}
          incoming={{ content: slides[1], index: 1, ready: ready.has(1) }}
          panelWidth="min(14rem, 38vw)"
        />
      </div>

      <div className="flex flex-col gap-6 border-t p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ToggleGroup
            aria-label="Variant"
            size="sm"
            spacing={0.5}
            value={[variant]}
            // Pressing the selected item empties the group, so keep the last pick.
            onValueChange={([next]) => {
              if (next === "door" || next === "book") setVariant(next);
            }}
            className="bg-muted p-0.5"
          >
            <ToggleGroupItem value="door" className={VARIANT_ITEM}>
              Door
            </ToggleGroupItem>
            <ToggleGroupItem value="book" className={VARIANT_ITEM}>
              Book
            </ToggleGroupItem>
          </ToggleGroup>
          <FoldControls progress={progress} />
        </div>

        <FoldHud progress={progress} />
      </div>
    </div>
  );
}

/**
 * The slider and play button. Its own component so following the fold re-renders only this,
 * never the fold or the HUD.
 */
function FoldControls({ progress }: { progress: MotionValue<number> }) {
  const [value, setValue] = useState(() => progress.get());
  useMotionValueEvent(progress, "change", setValue);
  const reduced = useReducedMotion();

  const folded = value >= 0.5;

  const play = () => {
    const to = folded ? 0 : 1;
    if (reduced) {
      progress.jump(to);
      return;
    }
    // Picks up any speed the fold already has, so a press mid-play turns it round smoothly.
    animate(progress, to, PLAY_SPRING);
  };

  return (
    <div className="flex min-w-48 flex-1 items-center gap-4">
      <Slider
        aria-label="Fold progress"
        // In percent, so a screen reader reads a useful number.
        min={0}
        max={100}
        step={0.1}
        // An array, because the shadcn wrapper draws a thumb per value and reads a plain
        // number as a two-thumb range.
        value={[value * 100]}
        // Base UI hands back a number from the pointer and an array from the keyboard.
        // `jump` stops a running play, so dragging always wins.
        onValueChange={(values) => {
          const percent = Array.isArray(values) ? values[0] : values;
          progress.jump(percent / 100);
        }}
      />
      <Button variant="outline" onClick={play} className="w-18">
        {folded ? "Unfold" : "Fold"}
      </Button>
    </div>
  );
}
