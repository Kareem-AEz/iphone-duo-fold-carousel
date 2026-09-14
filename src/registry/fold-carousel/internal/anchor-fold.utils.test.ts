import { describe, expect, it } from "vitest";

import { anchorFold } from "./anchor-fold.utils";
import type { Fold } from "./fold-carousel.types";

const forward: Fold = { from: 0, direction: 1 };

describe("anchorFold", () => {
  it("keeps the same fold while a turn is in progress", () => {
    expect(anchorFold(forward, 0.5)).toBe(forward);
  });

  it("re-anchors on the next slide when a turn lands", () => {
    expect(anchorFold(forward, 1)).toEqual({ from: 1, direction: 1 });
  });

  it("treats a spring a hair short of the slide as landed", () => {
    expect(anchorFold(forward, 1 - 1e-4)).toEqual({ from: 1, direction: 1 });
  });

  it("does not mirror when a reversed turn lands a hair short of its start", () => {
    expect(anchorFold(forward, -1e-4)).toBe(forward);
  });

  it("mirrors when a fold at rest turns back", () => {
    expect(anchorFold({ from: 1, direction: 1 }, 0.9)).toEqual({
      from: 1,
      direction: -1,
    });
  });

  it("anchors behind a turn that skipped past several slides", () => {
    expect(anchorFold(forward, 2.5)).toEqual({ from: 2, direction: 1 });
  });
});
