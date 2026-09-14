type Slice = {
  from: number;
  to: number;
  /**
   * Bends the curve before it is smoothed. 1 is plain smoothstep. Above 1 the part lags and
   * then rushes, below 1 it leads and settles slowly.
   */
  bias?: number;
};

/**
 * Smoothstep across a slice, clamped to 0 to 1. `to` may sit below `from`, which runs the
 * curve backwards.
 */
export function smoothstep(
  value: number,
  { from, to, bias = 1 }: Slice = { from: 0, to: 1 },
) {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  const bent = t ** bias;

  return bent * bent * (3 - 2 * bent);
}
