/** `value` brought into `[0, size)`, however far past either end it has run. */
export function wrap(value: number, size: number) {
  return ((value % size) + size) % size;
}
