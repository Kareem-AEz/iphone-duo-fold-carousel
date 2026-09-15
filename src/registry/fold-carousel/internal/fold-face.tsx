import { useSyncExternalStore } from "react";
import { type MotionValue, motion, useTransform } from "motion/react";

import { SHADE } from "../config";
import { BLUR_LAYERS, shadeAlpha, shadeTurn } from "./face-ramps.utils";
import type { Side, Slide } from "./fold-carousel.types";
import { HINGE_OVERLAP, panels } from "./panels.utils";
import { SlideLayer } from "./slide-layer";

/** CSS gradients interpolate linearly, so the shade curve is sampled into stops. */
const SHADE_STOP_COUNT = 11;

/** The full-turn shade as a gradient, running out from the hinge. */
function shadeGradient(side: Side) {
  const stops = Array.from({ length: SHADE_STOP_COUNT }, (_, index) => {
    const edge = index / (SHADE_STOP_COUNT - 1);
    return `rgb(0 0 0 / ${shadeAlpha(edge).toFixed(3)}) ${(edge * 100).toFixed(1)}%`;
  });

  return `linear-gradient(to ${side}, ${stops.join(", ")})`;
}

const SHADE_GRADIENT: Record<Side, string> = {
  left: shadeGradient("left"),
  right: shadeGradient("right"),
};

/** Nothing to subscribe to. The snapshot only differs between server and client. */
const subscribe = () => () => {};

type BlurLayerProps = {
  slide: Slide;
  side: Side;
  slideLeft: string;
  screenTop: string;
  tilt: MotionValue<number>;
  layer: (typeof BLUR_LAYERS)[number];
};

/**
 * One fixed-radius blurred copy of the face, faded in over its slice of the tilt. The radius
 * never animates: a moving blur is re-rasterised every frame, a fixed one only once.
 */
function BlurLayer({
  slide,
  side,
  slideLeft,
  screenTop,
  tilt,
  layer,
}: BlurLayerProps) {
  const opacity = useTransform(tilt, [layer.from, layer.to], [0, 1]);

  return (
    <motion.div
      style={{
        opacity,
        filter: `blur(${panels(layer.radius)})`,
        maskImage: `linear-gradient(to ${side}, transparent ${layer.from * 100}%, black ${layer.to * 100}%)`,
        maskRepeat: "no-repeat",
      }}
      className="absolute inset-0"
    >
      <SlideLayer slide={slide} left={slideLeft} top={screenTop} />
    </motion.div>
  );
}

type FoldFaceProps = {
  /** The slide this face carries. Its side of the hinge picks which half shows. */
  slide: Slide;
  side: Side;
  /** The face's outline, from `useLeaf`. Empty while the face points away. */
  clipPath: MotionValue<string>;
  /** 0 flat against the screen to 1 edge-on. */
  tilt: MotionValue<number>;
  layerWidth: string;
  /** How far the layer hangs above and below the frame, to hold the magnified fold. */
  layerInset: string;
  screenTop: string;
};

/**
 * One face of a leaf: a flat copy of the slide clipped to the leaf's outline, with blur
 * copies and a shade on top. Every copy here is hidden from screen readers.
 */
export function FoldFace({
  slide,
  side,
  clipPath,
  tilt,
  layerWidth,
  layerInset,
  screenTop,
}: FoldFaceProps) {
  // The slide spans both halves, so shifting it by a panel picks which half shows.
  const slideLeft = side === "left" ? panels(0) : panels(-1, HINGE_OVERLAP);
  const overhang =
    side === "left"
      ? { right: `calc(50% - ${HINGE_OVERLAP}rem)` }
      : { left: `calc(50% - ${HINGE_OVERLAP}rem)` };
  const shadeOpacity = useTransform(() => shadeTurn(tilt.get()).opacity);
  const shadeStretch = useTransform(() => shadeTurn(tilt.get()).stretch);
  // False through hydration. The blur copies are invisible at rest, so the server HTML skips
  // them, and nothing can turn before hydration anyway.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <motion.div
      style={{
        clipPath,
        width: layerWidth,
        top: layerInset,
        bottom: layerInset,
        ...overhang,
      }}
      // `clip-path` does not clip overflow, and the slide is two panels wide. Without this a
      // face swung past the hinge would paint its other half over the frame.
      className="absolute overflow-hidden"
    >
      <SlideLayer slide={slide} left={slideLeft} top={screenTop} />

      {/* Progressive blur. CSS allows one radius per element, so the shader's per-pixel ramp
          becomes stacked copies. Each spans the whole layer, so the blur spreads into the
          margin instead of stopping at the screen's edge. */}
      {hydrated &&
        BLUR_LAYERS.map((layer) => (
          <BlurLayer
            key={layer.from}
            layer={layer}
            slide={slide}
            side={side}
            slideLeft={slideLeft}
            screenTop={screenTop}
            tilt={tilt}
          />
        ))}

      {/* Shade, above the blur the way the shader darkens the blurred colour. Stretched from
          the dead zone's edge, not only faded, so it never flattens out partway across. */}
      <motion.div
        style={{
          opacity: shadeOpacity,
          scaleX: shadeStretch,
          originX: side === "left" ? 1 - SHADE.deadZone : SHADE.deadZone,
          backgroundImage: SHADE_GRADIENT[side],
        }}
        className="absolute inset-0"
      />
    </motion.div>
  );
}
