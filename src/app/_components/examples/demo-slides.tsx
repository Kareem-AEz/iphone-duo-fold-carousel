import Image from "next/image";

const PHOTOS = [
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
];

/** The photos every carousel on the page folds through. The first is above the fold. */
export const DEMO_SLIDES = PHOTOS.map(({ src, alt }, index) => (
  <Image
    key={src}
    src={src}
    alt={alt}
    sizes="(min-width: 48rem) 40rem, 84vw"
    fill
    preload={index === 0}
  />
));
