"use client";

import { Fragment, type ReactNode } from "react";
import { type MotionValue, motion, useTransform } from "motion/react";
import { cn } from "cn";

import { DEFAULTS } from "@/registry/fold-carousel/config";
import {
  BLUR_LAYERS,
  shadeAlpha,
} from "@/registry/fold-carousel/internal/face-ramps.utils";
import { smoothstep } from "@/registry/fold-carousel/internal/smoothstep.utils";
import { LEAF_TURN } from "@/registry/fold-carousel/internal/use-leaf";

const radians = (deg: number) => (deg * Math.PI) / 180;

/** Both view diagrams draw in this box, in SVG units. */
const VIEW = "0 0 120 64";
/** The top view: where the hinge sits, and how long each half is. */
const TOP = { x: 60, y: 58, half: 48 };
/** Radius of the arc that marks the lift. */
const LIFT_ARC = 14;
/** The front view: where the hinge's midpoint sits, and one square panel's size. */
const FRONT = { x: 60, y: 32, panel: 44 };

/**
 * Each ramp track, laid out like the frame: the hinge down the middle and a panel's outer
 * edge at either end, so a ramp sits on the same half as the face it describes.
 */
const TRACK = { width: 200, height: 20 };
const HALF = TRACK.width / 2;
const TRACK_VIEW = `0 0 ${TRACK.width} ${TRACK.height}`;
/** Which half of the track: -1 left of the hinge, 1 right. */
const TRACK_SIDES = [-1, 1] as const;
/** Space between blur bars, so eight read as eight. */
const BAR_GAP = 2;
const BLUR_MAX = Math.max(...BLUR_LAYERS.map((layer) => layer.radius));

const HINGE_LINE = (
  <line
    x1={HALF}
    y1={0}
    x2={HALF}
    y2={TRACK.height}
    strokeDasharray="1 3"
    className="opacity-30"
  />
);

/**
 * A fully tilted face's shade on each half, running out from the hinge and sampled finely
 * enough to draw as a curve. The area closes along the baseline.
 */
const SHADES = TRACK_SIDES.map((side) => {
  const line = `M ${Array.from({ length: 41 }, (_, index) => {
    const edge = index / 40;
    return `${(HALF + side * HALF * edge).toFixed(2)} ${(TRACK.height * (1 - shadeAlpha(edge))).toFixed(2)}`;
  }).join(" L ")}`;
  const area = `${line} L ${HALF + side * HALF} ${TRACK.height} L ${HALF} ${TRACK.height} Z`;

  return { side, line, area };
});

/**
 * What one fold is doing, read straight off `progress`: the leaf drawn from above and from
 * the front, and the blur and shade its face is drawn with. It draws the `book` leaf, and
 * `door`'s outgoing leaf, which turns the same way.
 *
 * Everything is a motion value, so the HUD tracks the fold every frame without React
 * rendering anything. The numbers come from the component's own internals, read only.
 */
export function FoldHud({ progress }: { progress: MotionValue<number> }) {
  /** Where the leaf points, from lying on the left half to lying on the right. */
  const leafAngle = useTransform(
    () => LEAF_TURN * smoothstep(progress.get()),
  );
  /** The leaf's angle off the screen: 0° flat, 90° edge-on. */
  const lift = useTransform(leafAngle, (deg) => Math.min(deg, LEAF_TURN - deg));

  const liftLabel = useTransform(lift, (deg) => `${Math.round(deg)}°`);
  const tipX = useTransform(
    leafAngle,
    (deg) => TOP.x - TOP.half * Math.cos(radians(deg)),
  );
  const tipY = useTransform(
    leafAngle,
    (deg) => TOP.y - TOP.half * Math.sin(radians(deg)),
  );
  // Swept from whichever half the leaf is nearer, which is the angle the readout names.
  const liftArc = useTransform(leafAngle, (deg) => {
    const side = deg <= LEAF_TURN / 2 ? -1 : 1;
    const endX = TOP.x - LIFT_ARC * Math.cos(radians(deg));
    const endY = TOP.y - LIFT_ARC * Math.sin(radians(deg));
    return `M ${TOP.x + side * LIFT_ARC} ${TOP.y} A ${LIFT_ARC} ${LIFT_ARC} 0 0 ${side < 0 ? 1 : 0} ${endX} ${endY}`;
  });

  // The same projection `useLeaf` clips each face with. The hinge edge keeps its height, the
  // far edge swings toward you and grows, and past edge-on it crosses over.
  const projection = useTransform(leafAngle, (deg) => {
    const scale = DEFAULTS.depth / (DEFAULTS.depth - Math.sin(radians(deg)));
    return { scale, visible: Math.cos(radians(deg)) * scale };
  });
  const clip = useTransform(projection, ({ scale, visible }) => {
    const farX = FRONT.x - FRONT.panel * visible;
    const hinge = FRONT.panel / 2;
    const far = (FRONT.panel * scale) / 2;
    return `M ${FRONT.x} ${FRONT.y - hinge} L ${farX} ${FRONT.y - far} L ${farX} ${FRONT.y + far} L ${FRONT.x} ${FRONT.y + hinge} Z`;
  });
  const scaleLabel = useTransform(
    projection,
    ({ scale }) => `×${scale.toFixed(2)}`,
  );

  /** The face's tilt, 0 flat to 1 edge-on. The same curve `useLeaf` hands each face. */
  const tilt = useTransform(lift, (deg) =>
    smoothstep(deg, { from: 0, to: LEAF_TURN / 2 }),
  );
  const tiltLabel = useTransform(tilt, (t) => `${Math.round(t * 100)}%`);
  // The face lies left of the hinge until edge-on, where its back takes over on the right.
  // Both ramps are full at the swap, so it reads as the face crossing over.
  const onLeft = useTransform(leafAngle, (deg): number =>
    deg <= LEAF_TURN / 2 ? 1 : 0,
  );
  const onRight = useTransform(onLeft, (left) => 1 - left);
  const shownOn = (side: TrackSide) => (side < 0 ? onLeft : onRight);

  return (
    <div className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-lg border">
      <Instrument label="Lift" value={liftLabel}>
        <Drawing view={VIEW}>
          {/* From above. The screen, the leaf's path, the edge-on line, and the leaf. */}
          <line
            x1={TOP.x - TOP.half}
            y1={TOP.y}
            x2={TOP.x + TOP.half}
            y2={TOP.y}
            className="opacity-30"
          />
          <path
            d={`M ${TOP.x - TOP.half} ${TOP.y} A ${TOP.half} ${TOP.half} 0 0 1 ${TOP.x + TOP.half} ${TOP.y}`}
            strokeDasharray="1 3"
            className="opacity-30"
          />
          <line
            x1={TOP.x}
            y1={TOP.y}
            x2={TOP.x}
            y2={TOP.y - TOP.half}
            strokeDasharray="1 3"
            className="opacity-30"
          />
          <motion.path d={liftArc} className="opacity-60" />
          <motion.line x1={TOP.x} y1={TOP.y} x2={tipX} y2={tipY} />
          <motion.circle
            cx={tipX}
            cy={tipY}
            r={1.75}
            className="fill-current"
          />
          <circle cx={TOP.x} cy={TOP.y} r={2} className="fill-background" />
        </Drawing>
      </Instrument>

      <Instrument label="Clip" value={scaleLabel}>
        <Drawing view={VIEW}>
          {/* From the front. The flat frame, the hinge, and the outline the face is cut to. */}
          <rect
            x={FRONT.x - FRONT.panel}
            y={FRONT.y - FRONT.panel / 2}
            width={FRONT.panel * 2}
            height={FRONT.panel}
            strokeDasharray="1 3"
            className="opacity-30"
          />
          <line
            x1={FRONT.x}
            y1={0}
            x2={FRONT.x}
            y2={64}
            strokeDasharray="1 3"
            className="opacity-30"
          />
          <motion.path
            d={clip}
            strokeLinejoin="round"
            className="fill-foreground/5"
          />
        </Drawing>
      </Instrument>

      <Instrument label="Ramps" value={tiltLabel} className="col-span-2">
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-4 gap-y-3">
          <Label>Blur</Label>
          <Drawing view={TRACK_VIEW}>
            {/* One bar per blurred copy, out from the hinge where its band starts. Height
                is its radius, fill is how far it has faded in. */}
            {HINGE_LINE}
            {TRACK_SIDES.map((side) =>
              BLUR_LAYERS.map((layer) => (
                <BlurBar
                  key={`${side}:${layer.from}`}
                  layer={layer}
                  side={side}
                  tilt={tilt}
                  shown={shownOn(side)}
                />
              )),
            )}
          </Drawing>

          <Label>Shade</Label>
          <Drawing view={TRACK_VIEW}>
            {/* Dotted, the shade fully tilted. Solid, the shade now: the same curve scaled
                up from the baseline, since the face fades it as one. */}
            <line
              x1={0}
              y1={TRACK.height}
              x2={TRACK.width}
              y2={TRACK.height}
              className="opacity-30"
            />
            {HINGE_LINE}
            {SHADES.map(({ side, line, area }) => (
              <Fragment key={side}>
                <path d={line} strokeDasharray="1 3" className="opacity-30" />
                <motion.g style={{ opacity: shownOn(side) }}>
                  <motion.g style={{ scaleY: tilt, originY: 1 }}>
                    <path
                      d={area}
                      stroke="none"
                      className="fill-current opacity-10"
                    />
                    <path d={line} />
                  </motion.g>
                </motion.g>
              </Fragment>
            ))}
          </Drawing>

          <div className="col-start-2 flex justify-between">
            <Label>Edge</Label>
            <Label>Hinge</Label>
            <Label>Edge</Label>
          </div>
        </div>
      </Instrument>
    </div>
  );
}

type TrackSide = (typeof TRACK_SIDES)[number];

type BlurBarProps = {
  layer: (typeof BLUR_LAYERS)[number];
  side: TrackSide;
  /** The face's tilt. This bar fills over its copy's own slice of it. */
  tilt: MotionValue<number>;
  /** 1 while the face is on this bar's half, 0 while it is on the other. */
  shown: MotionValue<number>;
};

/** One blurred copy: an outline for its radius, filled as the copy fades in. */
function BlurBar({ layer, side, tilt, shown }: BlurBarProps) {
  const fade = useTransform(tilt, [layer.from, layer.to], [0, 1]);
  const opacity = useTransform(() => fade.get() * shown.get());

  const near = HALF + side * HALF * layer.from;
  const far = HALF + side * HALF * layer.to;
  const height = TRACK.height * (layer.radius / BLUR_MAX);
  const bar = {
    x: Math.min(near, far) + BAR_GAP / 2,
    y: TRACK.height - height,
    width: HALF * (layer.to - layer.from) - BAR_GAP,
    height,
  };

  return (
    <>
      <rect {...bar} strokeDasharray="1 2" className="opacity-30" />
      {/* The fill fades on a group, because `x` and `y` on a motion element are transforms
          rather than the rect's own attributes. */}
      <motion.g style={{ opacity }}>
        <rect {...bar} stroke="none" className="fill-current" />
      </motion.g>
    </>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground font-mono text-[0.625rem] tracking-widest uppercase">
      {children}
    </span>
  );
}

type InstrumentProps = {
  label: string;
  value: MotionValue<string>;
  className?: string;
  children: ReactNode;
};

/** One cell of the HUD: a label, its live value, and whatever draws it. */
function Instrument({ label, value, className, children }: InstrumentProps) {
  return (
    <div className={cn("bg-background flex flex-col gap-3 p-3", className)}>
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <motion.span className="font-mono text-xs whitespace-nowrap tabular-nums">
          {value}
        </motion.span>
      </div>
      {children}
    </div>
  );
}

type DrawingProps = {
  /** The SVG `viewBox`, in the units its children draw in. */
  view: string;
  /** Drawn with a 1px stroke in the text colour. */
  children: ReactNode;
};

function Drawing({ view, children }: DrawingProps) {
  return (
    <svg
      aria-hidden
      viewBox={view}
      fill="none"
      stroke="currentColor"
      // Strokes stay a hairline however far the box scales.
      className="w-full overflow-visible **:[vector-effect:non-scaling-stroke]"
    >
      {children}
    </svg>
  );
}
