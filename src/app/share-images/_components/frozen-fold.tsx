"use client";

import type { ComponentProps } from "react";
import { useMotionValue } from "motion/react";

import { FoldBook } from "@/registry/fold-carousel/internal/fold-book";

type FrozenFoldProps = Omit<ComponentProps<typeof FoldBook>, "progress"> & {
  progress: number;
};

/** The real `book` fold, held still at `progress`, so a screenshot catches it mid-turn. */
export function FrozenFold({ progress, ...props }: FrozenFoldProps) {
  const value = useMotionValue(progress);

  return <FoldBook progress={value} {...props} />;
}
