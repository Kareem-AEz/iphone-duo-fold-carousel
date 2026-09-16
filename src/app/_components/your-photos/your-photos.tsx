"use client";

import { type ReactNode, useRef } from "react";

import { usePhotoSlides } from "@/app/_components/your-photos/use-photo-slides";
import { Button } from "@/components/ui/button";
import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/registry/fold-carousel/fold-carousel";

/**
 * A carousel that folds through photos picked from the visitor's device, falling back to
 * `slides` until they pick some. The photos never leave the browser.
 */
export function YourPhotos({ slides }: { slides: ReactNode[] }) {
  const input = useRef<HTMLInputElement>(null);
  const { photos, preparing, error, pick, reset } = usePhotoSlides();

  const photoSlides = photos?.urls.map((url, index) => (
    // `next/image` resizes on the server, which a `blob:` URL can't reach and shouldn't.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={url}
      src={url}
      alt={`Your photo ${index + 1} of ${photos.urls.length}`}
    />
  ));

  return (
    <div className="rounded-xl border">
      {/* The padding clears the leaf, which reaches past the frame mid-turn. */}
      <div className="flex justify-center px-4 py-14">
        {/* A new set remounts the carousel. Readiness is kept by index, so without it a new
            photo would count as ready before it can draw. */}
        <FoldCarousel
          key={photos?.id ?? 0}
          slides={photoSlides ?? slides}
          aria-label={photos ? "Your photos" : "Landscapes"}
          className="flex flex-col items-center gap-14"
        >
          <FoldCarouselFrame panelWidth="min(14rem, 38vw)" />
          <div className="flex gap-2">
            <FoldCarouselPrevious />
            <FoldCarouselNext />
          </div>
        </FoldCarousel>
      </div>

      <div className="flex flex-col gap-3 border-t p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={preparing}
            onClick={() => input.current?.click()}
          >
            {pickLabel(preparing, photos !== null)}
          </Button>
          {photos && (
            <Button variant="ghost" disabled={preparing} onClick={reset}>
              Reset
            </Button>
          )}
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              // Clears the pick, so choosing the same files again still fires a change.
              event.target.value = "";
              if (files.length) pick(files);
            }}
          />
        </div>
        <p className="text-muted-foreground text-sm text-pretty">
          Pick 2 to 8. Your photos never leave this tab, and the frame crops
          them to 2:1.
        </p>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function pickLabel(preparing: boolean, hasPhotos: boolean) {
  if (preparing) return "Preparing…";
  if (hasPhotos) return "Change photos";
  return "Use your photos";
}
