// Masonry packing for a CSS grid of cards whose heights differ — a card with a banner image
// next to one without no longer leaves a hole under the shorter one; the next card slots in
// directly beneath it instead.
//
// The grid keeps its own columns (grid-cols-*) and DOM order, so tab order and screen-reader
// order stay newest-first. What changes is rows: the grid gets tiny 2px rows and each item
// spans however many its measured height needs, which lets auto-placement tuck items under
// whichever column frees up first. Items hidden with display:none (the news filters) simply
// drop out of placement, so filtering needs no extra call.
//
// Plain classic-script JavaScript, not a module: MasonryPack.astro inlines this file's text
// right after the grid, so the packing happens while the page is still being parsed, before
// the first paint. Run later (as a deferred module script, which it first was) the browser
// paints ordinary rows and then every card jumps into its column, a layout shift that scored
// a CLS of ~0.5-1.0 on /news/ (Google rates anything over 0.25 poor). Packed before paint, ~0.
//
// Without JS the grid is left untouched and falls back to ordinary aligned rows.
//
// Native CSS masonry (display: grid-lanes) would replace all of this once it ships in every
// browser the site supports.
function refineryMasonry(grid) {
  // Only worth it when card heights genuinely differ, which here means some card has an
  // image. A grid of text-only cards (most team pages' news) is near-even already, and
  // packing it would only stagger the columns and put the dates out of order across rows.
  if (!grid.querySelector('img')) return;

  var ROW_UNIT = 2;
  // Read the grid's authored row gap (e.g. gap-6) before overriding it: the gap is folded
  // into each item's span below, since real row gaps would multiply across hundreds of rows.
  // Inline styles rather than a class, because Tailwind's gap utility sits in a later
  // cascade layer and would win over a component-layer rule.
  var gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  grid.style.gridAutoRows = ROW_UNIT + 'px';
  grid.style.rowGap = '0';
  // Items must keep their natural height to be measured; stretched to their grid area, they
  // would report the span we set and never shrink.
  grid.style.alignItems = 'start';

  function size(item) {
    // offsetHeight ignores transforms, so the reveal animation's translateY doesn't skew it.
    var span = Math.ceil((item.offsetHeight + gap) / ROW_UNIT);
    item.style.gridRowEnd = 'span ' + Math.max(span, 1);
  }

  // Pack now, synchronously: reading offsetHeight forces layout, so the spans are in place
  // before the browser paints anything.
  for (var i = 0; i < grid.children.length; i++) size(grid.children[i]);

  // Then re-size an item whenever its height changes: a column width change at a breakpoint,
  // a web font swapping in, or NewsCard's onerror removing a dead publisher thumbnail.
  var observer = new ResizeObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) size(entries[j].target);
  });
  for (var k = 0; k < grid.children.length; k++) observer.observe(grid.children[k]);
}
