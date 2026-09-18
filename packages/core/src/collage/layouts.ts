/** One photo slot in a layout, as fractions of the collage width/height. */
export interface CollageSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A collage layout template. */
export interface CollageLayout {
  id: string;
  name: string;
  /** Number of photos the layout holds. */
  count: number;
  kind: 'grid' | 'poster';
  slots: CollageSlot[];
  /** Suggested output aspect ratio (width/height). */
  aspect: number;
}

function grid(cols: number, rows: number): CollageSlot[] {
  const slots: CollageSlot[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      slots.push({ x: c / cols, y: r / rows, w: 1 / cols, h: 1 / rows });
  return slots;
}

function layout(
  id: string,
  name: string,
  kind: CollageLayout['kind'],
  aspect: number,
  slots: CollageSlot[],
): CollageLayout {
  return { id, name, kind, aspect, count: slots.length, slots };
}

/** Built-in grid layouts, 1 to 9 photos. Names describe the shape so users can guess them. */
export const COLLAGE_LAYOUTS: readonly CollageLayout[] = [
  layout('1-full', 'Single', 'grid', 1, grid(1, 1)),
  layout('2-side', 'Side by side', 'grid', 1, grid(2, 1)),
  layout('2-stack', 'Stacked', 'grid', 1, grid(1, 2)),
  layout('2-big-left', 'Big left', 'grid', 1, [
    { x: 0, y: 0, w: 0.66, h: 1 },
    { x: 0.66, y: 0, w: 0.34, h: 1 },
  ]),
  layout('2-big-top', 'Big top', 'grid', 1, [
    { x: 0, y: 0, w: 1, h: 0.66 },
    { x: 0, y: 0.66, w: 1, h: 0.34 },
  ]),
  layout('3-row', 'Three across', 'grid', 1.5, grid(3, 1)),
  layout('3-column', 'Three down', 'grid', 0.66, grid(1, 3)),
  layout('3-left-two', 'One + two', 'grid', 1, [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ]),
  layout('3-top-two', 'Top + two', 'grid', 1, [
    { x: 0, y: 0, w: 1, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ]),
  layout('4-grid', 'Four grid', 'grid', 1, grid(2, 2)),
  layout('4-row', 'Four across', 'grid', 2, grid(4, 1)),
  layout('4-big-left', 'Big + three', 'grid', 1, [
    { x: 0, y: 0, w: 0.66, h: 1 },
    { x: 0.66, y: 0, w: 0.34, h: 1 / 3 },
    { x: 0.66, y: 1 / 3, w: 0.34, h: 1 / 3 },
    { x: 0.66, y: 2 / 3, w: 0.34, h: 1 / 3 },
  ]),
  layout('4-big-top', 'Big + three below', 'grid', 1, [
    { x: 0, y: 0, w: 1, h: 0.66 },
    { x: 0, y: 0.66, w: 1 / 3, h: 0.34 },
    { x: 1 / 3, y: 0.66, w: 1 / 3, h: 0.34 },
    { x: 2 / 3, y: 0.66, w: 1 / 3, h: 0.34 },
  ]),
  layout(
    '5-centre',
    'Centre feature',
    'grid',
    1,
    [
      { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
      { x: 0, y: 0, w: 0.5, h: 0.25 },
      { x: 0.5, y: 0, w: 0.5, h: 0.25 },
      { x: 0, y: 0.75, w: 0.5, h: 0.25 },
      { x: 0.5, y: 0.75, w: 0.5, h: 0.25 },
    ].map((s) => s),
  ),
  layout('5-two-three', 'Two + three', 'grid', 1, [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
    { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
  ]),
  layout('6-grid', 'Six grid', 'grid', 1.5, grid(3, 2)),
  layout('6-tall', 'Six tall', 'grid', 0.66, grid(2, 3)),
  layout('7-feature', 'Feature + six', 'grid', 1, [
    { x: 0, y: 0, w: 2 / 3, h: 2 / 3 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
    { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
    { x: 0, y: 2 / 3, w: 1 / 4, h: 1 / 3 },
    { x: 1 / 4, y: 2 / 3, w: 1 / 4, h: 1 / 3 },
    { x: 1 / 2, y: 2 / 3, w: 1 / 4, h: 1 / 3 },
    { x: 3 / 4, y: 2 / 3, w: 1 / 4, h: 1 / 3 },
  ]),
  layout('8-grid', 'Eight grid', 'grid', 1, grid(4, 2)),
  layout('9-grid', 'Nine grid', 'grid', 1, grid(3, 3)),
  layout('poster-2', 'Poster duo', 'poster', 0.8, [
    { x: 0.08, y: 0.08, w: 0.84, h: 0.42 },
    { x: 0.08, y: 0.54, w: 0.84, h: 0.3 },
  ]),
  layout('poster-3', 'Poster trio', 'poster', 0.8, [
    { x: 0.08, y: 0.08, w: 0.84, h: 0.5 },
    { x: 0.08, y: 0.62, w: 0.4, h: 0.22 },
    { x: 0.52, y: 0.62, w: 0.4, h: 0.22 },
  ]),
  layout('poster-4', 'Poster quad', 'poster', 0.8, [
    { x: 0.08, y: 0.08, w: 0.4, h: 0.36 },
    { x: 0.52, y: 0.08, w: 0.4, h: 0.36 },
    { x: 0.08, y: 0.48, w: 0.4, h: 0.36 },
    { x: 0.52, y: 0.48, w: 0.4, h: 0.36 },
  ]),
  layout('poster-polaroid', 'Polaroid wall', 'poster', 1, [
    { x: 0.06, y: 0.08, w: 0.42, h: 0.42 },
    { x: 0.52, y: 0.14, w: 0.42, h: 0.42 },
    { x: 0.1, y: 0.54, w: 0.42, h: 0.42 },
  ]),
];

/** Returns layouts that hold exactly `count` photos. */
export function layoutsForCount(count: number): CollageLayout[] {
  return COLLAGE_LAYOUTS.filter((l) => l.count === count);
}

/** Finds a layout by id. */
export function findLayout(id: string): CollageLayout | undefined {
  return COLLAGE_LAYOUTS.find((l) => l.id === id);
}

/**
 * Builds a "stitch" layout: photos joined edge to edge vertically or horizontally, each slot
 * sized by its aspect ratio so nothing is cropped (long-screenshot style).
 */
export function stitchLayout(
  aspects: number[],
  direction: 'vertical' | 'horizontal',
): CollageLayout {
  const slots: CollageSlot[] = [];
  if (direction === 'vertical') {
    // Common width 1; heights proportional to 1/aspect.
    const heights = aspects.map((a) => 1 / a);
    const total = heights.reduce((s, h) => s + h, 0);
    let y = 0;
    for (const h of heights) {
      slots.push({ x: 0, y: y / total, w: 1, h: h / total });
      y += h;
    }
    return {
      id: 'stitch-v',
      name: 'Stitch vertical',
      kind: 'grid',
      count: aspects.length,
      slots,
      aspect: 1 / total,
    };
  }
  const widths = aspects.map((a) => a);
  const total = widths.reduce((s, w) => s + w, 0);
  let x = 0;
  for (const w of widths) {
    slots.push({ x: x / total, y: 0, w: w / total, h: 1 });
    x += w;
  }
  return {
    id: 'stitch-h',
    name: 'Stitch horizontal',
    kind: 'grid',
    count: aspects.length,
    slots,
    aspect: total,
  };
}
