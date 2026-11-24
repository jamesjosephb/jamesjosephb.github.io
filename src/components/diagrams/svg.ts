/**
 * Small helpers for the hand-placed SVG diagrams. Coordinates are in viewBox units; colours come from CSS classes
 * that use theme tokens, so the diagrams follow light and dark mode.
 */

export type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  /** Draw as a database (a cylinder). */
  db?: boolean;
  /** Highlight (accent border). */
  key?: boolean;
};

/** Baselines for `n` centred lines in a box, given the first line's size and the others' line height. */
export function baselines(b: Box, size: number, lh: number): number[] {
  const n = b.lines.length;
  const top = b.db ? 12 : 0; // keep text below a cylinder's lid
  const cy = b.y + top + (b.h - top) / 2;
  const first = cy - ((n - 1) * lh) / 2 + size * 0.35;
  return b.lines.map((_, i) => first + i * lh);
}

/** Outline of a cylinder: lid ellipse, sides and the bottom curve. */
export function cylinder(b: Box, ry = 7): { body: string; lid: string } {
  const { x, y, w, h } = b;
  const rx = w / 2;
  const body = `M${x} ${y + ry} V${y + h - ry} A${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} V${y + ry}`;
  const lid = `M${x} ${y + ry} A${rx} ${ry} 0 0 1 ${x + w} ${y + ry} A${rx} ${ry} 0 0 1 ${x} ${y + ry} Z`;
  return { body, lid };
}
