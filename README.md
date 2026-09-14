# Fold Carousel

A carousel that folds from one slide to the next like a two-panel phone. The image stays flat, and the frame changes shape around it with clipping, blur, and shading.

**Live preview:** [iphone-duo-fold-animation.vercel.app](https://iphone-duo-fold-animation.vercel.app/)

## Install

Needs a project set up with [shadcn](https://ui.shadcn.com/docs/installation).

```bash
npx shadcn@latest add Kareem-AEz/iphone-duo-fold-carousel/fold-carousel
```

This adds `components/ui/fold-carousel/` and installs `motion`, `lucide-react`, and `cn`.

## Usage

```tsx
import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from "@/components/ui/fold-carousel/fold-carousel";

const slides = [
  <img src="/one.jpg" alt="…" />,
  <img src="/two.jpg" alt="…" />,
  <img src="/three.jpg" alt="…" />,
];

export function Gallery() {
  return (
    <FoldCarousel slides={slides} aria-label="Gallery">
      <FoldCarouselFrame variant="door" />
      <FoldCarouselPrevious />
      <FoldCarouselNext />
    </FoldCarousel>
  );
}
```

Slides can be any element that fills a box, like `img` or `next/image` with `fill`. A 2:1 image fits the frame without cropping. The fold paints each slide about ten times, so it is built for images, not video or interactive content.

## API

### `FoldCarousel`

Holds the state. Put a frame and any controls inside it. Takes every `div` prop.

| Prop            | Type                      | Default |
| --------------- | ------------------------- | ------- |
| `slides`        | `ReactNode[]`             |         |
| `loop`          | `boolean`                 | `true`  |
| `duration`      | `number` (seconds)        | `0.8`   |
| `defaultIndex`  | `number`                  | `0`     |
| `onIndexChange` | `(index: number) => void` |         |

### `FoldCarouselFrame`

The folding picture. Takes every `div` prop.

| Prop         | Type                   | Default              |
| ------------ | ---------------------- | -------------------- |
| `variant`    | `"door"` \| `"book"`   | `"door"`             |
| `panelWidth` | any CSS length         | `"min(23rem, 42vw)"` |
| `depth`      | `number` (panel widths) | `88 / 23`            |

`door` swings the next slide in behind the current one. `book` lays it underneath, like turning a page. The frame is two panels wide, so `panelWidth` sets its whole size.

### `FoldCarouselPrevious` and `FoldCarouselNext`

shadcn `Button`s. They take every `Button` prop, and children replace the icon.

### `useFoldCarousel`

Reads the surrounding carousel, for building your own controls.

```tsx
const { index, count, canPrev, canNext, prev, next, goTo } = useFoldCarousel();
```

### `config.ts`

Default values, the door's leaf stagger, and the blur and shade ramps. Everything in `internal/` is geometry the fold depends on.

## Accessibility

- Arrow keys change slides while focus is inside the carousel.
- Screen readers hear each slide once, and a live region announces "Slide 2 of 4" on change.
- With reduced motion turned on, slides cut instead of folding.

## Credits

Demo photos from Pexels: [Elvin Muradzade](https://www.pexels.com/photo/34492458/), [Massih](https://www.pexels.com/photo/8177145/), [second897](https://www.pexels.com/photo/8557328/), [cottonbro studio](https://www.pexels.com/photo/9906684/).
