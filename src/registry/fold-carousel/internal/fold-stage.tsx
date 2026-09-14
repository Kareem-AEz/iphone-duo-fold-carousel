import type { ComponentProps, CSSProperties } from "react";
import { cn } from "cn";

import { DEFAULTS } from "../config";
import { panels } from "./panels.utils";

type FoldStageProps = ComponentProps<"div"> & {
  panelWidth?: string;
  /** Perspective distance, in panel widths. */
  depth: number;
  /** Mirrors the fold, so the right half turns onto a still left half. */
  mirrored?: boolean;
  bezelColor?: string;
};

/**
 * The box a fold happens in. Its `font-size` is one panel wide, so every length inside is
 * written in `em` and a responsive panel width is plain CSS, with no resize listener.
 */
export function FoldStage({
  panelWidth = DEFAULTS.panelWidth,
  depth,
  mirrored = false,
  bezelColor = DEFAULTS.bezelColor,
  className,
  style,
  children,
  ...props
}: FoldStageProps) {
  // A custom property, so the leaf bodies and slides inside read this frame's colour without
  // passing it down. React's style type has no custom properties, hence the cast.
  const bezel = { "--fold-bezel": bezelColor } as CSSProperties;

  return (
    <div
      // Slide layers read this to flip their content back, so the slide never mirrors.
      data-mirrored={mirrored || undefined}
      style={{
        ...bezel,
        fontSize: panelWidth,
        // The origin stays centred, on the hinge, which `useLeaf` assumes.
        perspective: panels(depth),
        height: panels(1),
        // One static flip mirrors every leaf, rotation, and ramp at once.
        transform: mirrored ? "scaleX(-1)" : undefined,
        ...style,
      }}
      className={cn("relative flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}
