// Masonry packing for a CSS grid of cards whose heights differ — a card with a banner image
// next to one without no longer leaves a hole under the shorter one; the next card slots in
// directly beneath it instead.
//
// The grid keeps its own columns (grid-cols-*) and DOM order, so tab order and screen-reader
// order stay newest-first. What changes is rows: the grid gets tiny ROW_UNIT-pixel rows and
// each item spans however many its measured height needs, which lets auto-placement tuck
// items under whichever column frees up first. Items hidden with display:none (the news
// filters) simply drop out of placement, so filtering needs no extra call.
//
// Without JS the grid is left untouched and falls back to ordinary aligned rows.
//
// Native CSS masonry (display: grid-lanes) would replace all of this once it ships in every
// browser the site supports.
const ROW_UNIT = 2;

export function masonry(grid: HTMLElement) {
  // Read the grid's authored row gap (e.g. gap-6) before overriding it: the gap is folded
  // into each item's span below, since real row gaps would multiply across hundreds of rows.
  // Inline styles rather than a class, because Tailwind's gap utility sits in a later
  // cascade layer and would win over a component-layer rule.
  const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  grid.style.gridAutoRows = `${ROW_UNIT}px`;
  grid.style.rowGap = '0';
  // Items must keep their natural height to be measured; stretched to their grid area, they
  // would report the span we set and never shrink.
  grid.style.alignItems = 'start';

  const size = (item: HTMLElement) => {
    // offsetHeight ignores transforms, so the reveal animation's translateY doesn't skew it.
    const span = Math.ceil((item.offsetHeight + gap) / ROW_UNIT);
    item.style.gridRowEnd = `span ${Math.max(span, 1)}`;
  };

  // Fires on first observe and again whenever an item's height changes: a column width
  // change at a breakpoint, a web font swapping in, a lazy image arriving, or NewsCard's
  // onerror removing a dead publisher thumbnail.
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) size(entry.target as HTMLElement);
  });
  for (const item of grid.children) observer.observe(item);
}
