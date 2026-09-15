import { type ApiRow, ApiTable } from "@/app/_components/api-table";
import { DEFAULTS } from "@/registry/fold-carousel/config";

const CAROUSEL_PROPS: ApiRow[] = [
  {
    name: "slides",
    type: "ReactNode[]",
    description:
      "One slide per item. Anything that fills a box works, like img or next/image with fill.",
  },
  {
    name: "loop",
    type: "boolean",
    defaultValue: String(DEFAULTS.loop),
    description: "Whether the last slide folds on to the first.",
  },
  {
    name: "duration",
    type: "number",
    defaultValue: String(DEFAULTS.duration),
    description: "Seconds a turn takes to settle onto a slide.",
  },
  {
    name: "defaultIndex",
    type: "number",
    defaultValue: "0",
    description: "The slide shown first.",
  },
  {
    name: "onIndexChange",
    type: "(index: number) => void",
    description:
      "Called with the slide a turn is heading for, as soon as it starts.",
  },
];

const FRAME_PROPS: ApiRow[] = [
  {
    name: "variant",
    type: '"door" | "book"',
    defaultValue: '"door"',
    description:
      "door swings the next slide in behind the current one. book lays it underneath, like a page.",
  },
  {
    name: "panelWidth",
    type: "string",
    defaultValue: `"${DEFAULTS.panelWidth}"`,
    description:
      "Width of one square panel, as any CSS length. The frame is two panels wide.",
  },
  {
    name: "depth",
    type: "number",
    defaultValue: DEFAULTS.depth.toFixed(2),
    description:
      "Perspective distance, in panel widths. Lower is more dramatic. Must stay above 1.",
  },
  {
    name: "bezelColor",
    type: "string",
    defaultValue: `"${DEFAULTS.bezelColor}"`,
    description:
      "Any CSS color. Shows on a leaf's edge mid-turn, and in place of a slide until its images have loaded.",
  },
];

const HOOK_VALUES: ApiRow[] = [
  {
    name: "index",
    type: "number",
    description: "The slide a turn is heading for.",
  },
  { name: "count", type: "number", description: "How many slides there are." },
  {
    name: "canPrev, canNext",
    type: "boolean",
    description: "False at the ends when loop is off.",
  },
  {
    name: "prev, next",
    type: "() => void",
    description: "Folds one slide back or on.",
  },
  {
    name: "goTo",
    type: "(slide: number) => void",
    description: "Folds to a slide, the short way round when looping.",
  },
];

/** Every public part of the component, with defaults read from its config. */
export function ApiReference() {
  return (
    <div className="flex flex-col gap-12">
      <ApiPart
        name="FoldCarousel"
        description="Holds the state. Put a frame and any controls inside it. Takes every div prop."
      >
        <ApiTable rows={CAROUSEL_PROPS} />
      </ApiPart>

      <ApiPart
        name="FoldCarouselFrame"
        description="The folding picture. Takes every div prop."
      >
        <ApiTable rows={FRAME_PROPS} />
      </ApiPart>

      <ApiPart
        name="FoldCarouselPrevious, FoldCarouselNext"
        description="shadcn Buttons. They take every Button prop, children replace the icon, and they stay focusable when disabled."
      />

      <ApiPart
        name="useFoldCarousel"
        description="Reads the surrounding carousel, for building your own controls."
      >
        <ApiTable rows={HOOK_VALUES} label="Value" />
      </ApiPart>
    </div>
  );
}

type ApiPartProps = {
  name: string;
  description: string;
  children?: React.ReactNode;
};

function ApiPart({ name, description, children }: ApiPartProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-mono text-sm">{name}</h3>
        <p className="text-muted-foreground text-sm text-pretty">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
