import Image from "next/image";

import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/registry/fold-carousel/fold-carousel";

/** The frame is two panels wide, so the slide is twice this. */
const PANEL_WIDTH = "min(23rem, 42vw)";

const SLIDES = [
  {
    src: "/slides/pexels-elvin-muradzade-1879795-34492458.jpg",
    alt: "Pine forest silhouette against hazy mountains",
  },
  {
    src: "/slides/pexels-massih-8177145.jpg",
    alt: "Blue desert mountain ridges under a heavy cloud",
  },
  {
    src: "/slides/pexels-second897-8557328.jpg",
    alt: "Dark mountain range with a lit village in the valley",
  },
  {
    src: "/slides/pexels-cottonbro-9906684.jpg",
    alt: "Golden hour light on layered rolling hills",
  },
].map(({ src, alt }, index) => (
  <Image
    key={src}
    src={src}
    alt={alt}
    sizes="min(46rem, 84vw)"
    fill
    priority={index === 0}
  />
));

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-5 py-16">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-medium">Fold Carousel</h1>
        <p className="text-muted-foreground text-sm">
          A carousel that folds like a two-panel phone.
        </p>
      </header>

      {/* The gap clears the leaf, which reaches past the frame mid-turn. */}
      <FoldCarousel
        slides={SLIDES}
        aria-label="Landscapes"
        className="flex flex-col items-center gap-20 py-16"
      >
        <FoldCarouselFrame variant="door" panelWidth={PANEL_WIDTH} />
        <div className="flex gap-2">
          <FoldCarouselPrevious />
          <FoldCarouselNext />
        </div>
      </FoldCarousel>
    </main>
  );
}
