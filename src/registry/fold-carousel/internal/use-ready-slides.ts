import { type RefObject, useEffect, useState } from "react";

/**
 * Which slides are ready to show: every image in their copies inside `stage` has loaded and
 * decoded. Checks the outgoing and incoming slides whenever they change, and a slide stays
 * ready once it is. Returns the indices of the ready slides.
 */
export function useReadySlides(
  stage: RefObject<HTMLElement | null>,
  outgoing: number,
  incoming: number,
) {
  const [ready, setReady] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    // No stage while there are no slides to draw.
    if (!stage.current) return;

    for (const index of [outgoing, incoming]) {
      if (ready.has(index)) continue;

      const images = stage.current.querySelectorAll<HTMLImageElement>(
        `[data-slide-index="${index}"] img`,
      );

      // `decode` waits for the download too, and an image decoded this way draws on its first
      // frame, so every copy switches to the photo together.
      Promise.all(Array.from(images, (image) => image.decode())).then(
        () =>
          setReady((previous) =>
            previous.has(index) ? previous : new Set(previous).add(index),
          ),
        // A broken image keeps the bezel, which is how the frame shows a missing photo.
        () => {},
      );
    }
  }, [stage, outgoing, incoming, ready]);

  return ready;
}
