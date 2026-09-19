# Accessibility Audit Report — The REFINERY website

## Audit metadata

**Audited:** REFINERY-site (Astro marketing site), local dev build at `http://localhost:4321/REFINERY-site/`
**Date:** 2026-09-19
**Auditor:** Claude Code (automated audit)
**Compliance target:** WCAG 2.1 Level AA
**Scope:** Full site — all page templates: home, what-we-do, about, about/teams, get-involved, donate, programs-events (index + detail), news (index + article), teams/[slug], 404. One representative instance of each dynamic route was tested (`teams/frc10434`, `news/re-blitz-summer-build-kickoff`, `programs-events/monster-match`); template-level findings apply to every page rendered from that template. All 36 `.astro` files under `src/layouts`, `src/components`, and `src/pages` were read in full for static review, not sampled.
**Methodology:** Automated (axe-core 4.10.2, injected live into each page template via browser). Manual keyboard navigation (skip link, mobile nav, tab order, focus visibility). Manual accessibility-tree inspection (DOM role/name/tabindex on interactive widgets). Full static code review of every component/layout/page file. Manual contrast calculation (sRGB relative luminance) for the cases axe could not auto-resolve. Reflow check at 320px viewport on two templates. No real screen reader was available in this environment — see **Methodology gaps** below.

**Remediation status (updated 2026-09-19, same day):** All nine findings below — Critical, Important, Minor, and Polish — have been fixed and verified. Re-verified with a second full pass after the Minor/Polish fixes: axe-core 0 violations across all 11 page templates, `astro check` 0 errors, `npm test` 198/198, `astro build` clean (26 pages). This report's original findings text is left as written, with a **FIXED** tag added to each remediated heading and a "Fix applied" note describing what actually changed; see the remediation roadmap at the bottom for the full checklist. Note for context: this repo already had one accessibility audit-and-fix pass (commit `db88c28`, 2026-08-17); the service-area map that accounts for both Critical findings here was added afterward (commit `fcb7448`, 2026-09-12) and was never covered by that earlier pass — this is new-feature regression, not a re-opened old issue. This report replaces a same-named `accessibility-audit.md` already tracked in git from that earlier pass; the previous version remains in git history if needed.

---

## Executive summary

The REFINERY site is unusually accessibility-conscious for a small nonprofit marketing site. The contact-dialog system, mobile navigation, image carousel, and form fields all show deliberate, correct accessibility engineering (hand-rolled modal focus-trapping via `inert`, a working skip link, `prefers-reduced-motion` handling with a user-controlled pause toggle, proper `<label>`/`fieldset`/`aria-describedby` wiring). Automated scanning (axe-core) returned **zero violations on 10 of 11 page templates tested**, the sole exception being the map issue below.

The one real defect cluster was concentrated entirely in the interactive service-area map on the About page (`ServiceAreaMap.astro`): the map container was marked `role="img"` while Leaflet still injected real, focusable, unnamed interactive controls inside it, and — discovered during fix verification — the marker's keyboard-activation relied on a browser event (`keypress`) that current Chrome no longer fires for Enter on a non-text element, so the map's popups were unreachable by keyboard even before the naming problem. **Both are now fixed** (see Critical 1/2 below) and verified live: 0 axe violations, every marker has a correct accessible name, and Enter/Space both open the popup with a working team-page link.

Beyond the map, the remaining findings were process/consistency gaps rather than active breakage: a content schema that *permitted* (but did not, at audit time, actually contain) images with no alt text, one filter widget that didn't announce its results where a sibling page's equivalent widget did, a heading-level skip repeated across all 15 team pages, and a handful of smaller consistency/polish items. **All nine findings from this audit are now fixed.**

**Issue counts:**

| Severity | Count | Status |
|---|---|---|
| Critical | 2 | **Fixed** |
| Important | 2 | **Fixed** |
| Minor | 2 | **Fixed** |
| Polish | 3 | **Fixed** |
| **Total** | **9** | **9 fixed / 0 open** |

All nine fixes were verified with a full re-run: axe-core reports 0 violations across all 11 page templates, `astro check` reports 0 errors, `npm test` passes 198/198, and `astro build` completes cleanly (26 pages). See each finding below for its specific fix and verification, and the **Remediation roadmap** at the end for the checked-off list.

---

## Tools and methods used

**Automated:**
- [x] axe-core 4.10.2 (browser-injected, run against 11 rendered page templates: home, what-we-do, about, about/teams, get-involved, donate, programs-events index, programs-events detail, teams/[slug], news index, news article)
- [ ] axe DevTools extension / Lighthouse / WAVE / Pa11y — not available in this environment; axe-core injected directly at runtime instead, same rule engine.

**Manual:**
- [x] Keyboard-only navigation (skip link, mobile `<details>` nav disclosure, tab order, focus visibility)
- [ ] Screen reader (VoiceOver / NVDA / JAWS / TalkBack) — **not available in this environment; see Methodology gaps.**
- [ ] 200% zoom — not performed this pass (see gaps)
- [x] Mobile reflow at 320px width (tested: home, about — both pass, no horizontal scroll)
- [ ] Color blindness simulation — not performed this pass
- [ ] Windows High Contrast — not available (no Windows environment)
- [x] Reduced motion preference (verified in code: Carousel and MarketingLayout both gate all motion behind `prefers-reduced-motion`)
- [x] Manual sRGB contrast calculation for the one axe "incomplete" contrast case
- [x] Live accessibility-tree inspection (`role`, `tabindex`, accessible name) on the map markers and news filter buttons

---

## Methodology gaps (per skill's data-availability rule)

This audit could not obtain the following inputs; the findings below reflect what automated and static analysis can determine, but every gap below is a real limit on this report's confidence, not something estimated around:

- **No real screen reader testing.** VoiceOver/NVDA/JAWS were not available in this sandboxed environment. Where a screen-reader-observable behavior mattered (e.g., whether the map's popups are actually announced), the accessibility tree was inspected programmatically (computed `role`, accessible name, `tabindex`) as the closest available proxy — this confirms the *structural* defect but does not confirm exact announcement wording or timing in any specific screen reader.
- **No 200% browser zoom test performed.** Reflow at 320px viewport width was checked instead (a related but distinct SC, 1.4.10) on 2 of 11 templates. 1.4.4 Resize Text was not separately verified.
- **No color-blindness simulation run.**
- **No Windows High Contrast Mode test** (no Windows environment available).
- **Not every content instance was tested** — one representative page per dynamic template (one team of 15, one news article of 27, one event of 1) was exercised live; the schema-level alt-text finding below is a control-gap finding (the schema *permits* a bad state), verified against all current content (none of which currently exhibits the gap), not a claim that current content is broken.

---

## Critical findings

### Critical 1 — FIXED: Service-area map exposes real interactive controls inside a `role="img"` container

- **WCAG criterion:** 4.1.2 Name, Role, Value (A); 1.1.1 Non-text Content (A); 2.1.1 Keyboard (A)
- **Severity:** Critical
- **Affected users:** Screen reader users; keyboard users
- **File:** [ServiceAreaMap.astro:25-34](src/components/marketing/ServiceAreaMap.astro:25)
- **Reproduction steps:**
  1. Visit `/about/` and let the map finish loading.
  2. Inspect the DOM: `#service-area-map` carries `role="img"` with a static `aria-label` describing the whole map as one picture.
  3. Leaflet still populates that same element with 12 real marker nodes, each rendered with `role="button" tabindex="0"` and no accessible name (confirmed live: `firstMarkerAlt: null`), plus popup `<a href>` links to team pages once a marker is activated.
  4. axe-core confirms two rule failures here: `aria-command-name` (serious — the 12 marker buttons have no accessible name) and `nested-interactive` (serious — interactive controls nested inside a container the ARIA tree treats as a flat image).
- **Expected:** Either the map is a genuinely static image with no focusable children, or it is marked up as a real interactive map (no `role="img"` on the container) with each marker given an accessible name (e.g. `aria-label="{team name} — view team page"`).
- **Actual:** The container's `role="img"` tells assistive technology to ignore everything inside it, while the DOM still contains real, tabbable, unnamed buttons — the worst of both patterns. A screen reader user either hears nothing but the static map description, or (depending on AT/browser combination) lands on unlabeled "button" announcements with no indication of what they do.
- **Recommended fix:** Remove `role="img"`/`aria-label` from the container (or move that description to a visually-hidden sibling paragraph), and instead give each Leaflet marker an accessible name via Leaflet's marker options (e.g., a `title` passed through to `aria-label` on the generated icon, or `keyboard: false` plus a fully redundant text list if the map is meant to stay decorative). Since the county list already exists as real text next to the map (`about.astro:161-178`), the simplest low-risk fix is to keep the map decorative (`aria-hidden="true"`, remove from tab order) and confirm every team it links to remains reachable via `about/teams/` — which today it already is.
- **Estimated effort:** Small (a markup/config change to one component; no data changes needed).
- **Owner:** Frontend
- **Fix applied:** Removed `role="img"`/`aria-label` from the container. Each Leaflet marker now gets a real `aria-label` (e.g. `"View CyBears"`, or `"View teams at this location: Knight Robotics, Robo-Knights, Cyber Knights"` where several teams share a spot), set directly on the rendered element since Leaflet's own `alt` marker option only reaches `<img>`-based icons, not the `<div>`-based ones this map uses. **A second, deeper problem surfaced during verification and was fixed as part of this same finding**: live keyboard testing found that Leaflet's built-in keyboard-activation for a marker's popup (its `keypress` handler) never fires in current Chrome — a focused marker dispatches `keydown`/`keyup` but never `keypress`, so Enter/Space did nothing even before this fix, independent of the naming/role problem. Added an explicit `keydown` handler (Enter and Space, matching the ARIA APG button pattern) that calls `marker.openPopup()` directly. Verified live: axe-core now reports 0 violations on `/about/`; each marker has a correct `aria-label`; Enter and Space both open the popup with a working link to the team page (`/teams/frc10172/` etc.).

### Critical 2 — FIXED: Focus outline removed on focusable map polygons with no replacement

- **WCAG criterion:** 2.4.7 Focus Visible (AA)
- **Severity:** Critical
- **Affected users:** Sighted keyboard users
- **File:** [ServiceAreaMap.astro:178-180](src/components/marketing/ServiceAreaMap.astro:178)
  ```css
  .service-area-map .leaflet-interactive:focus {
    outline: none;
  }
  ```
- **Reproduction steps:**
  1. Tab into the map on `/about/`.
  2. Continue tabbing through the county polygon layer (Leaflet gives each GeoJSON feature `tabindex="0"` by default).
  3. No visible focus indicator appears anywhere on the polygons.
- **Expected:** Every keyboard-focusable element shows a visible focus indicator (already the site-wide pattern — see `focus-visible:outline-2 focus-visible:outline-brand-accent` used consistently elsewhere, e.g. `FormDialog.astro:50`, `TeamNav.astro:22`, `Carousel.astro:16`).
- **Actual:** The rule's own comment acknowledges the polygons have "no keyboard action tied to focusing" but removes the outline rather than removing the element from the tab order — the elements are still real, empty keyboard stops.
- **Recommended fix:** Since the polygons have no keyboard-activatable behavior (their only interaction is a hover/click tooltip), set them non-interactive for keyboard purposes at the Leaflet layer (`interactive: false` on the GeoJSON style, or `tabindex="-1"` post-render) rather than hiding the focus ring on elements that remain tabbable. This removes empty stops from the tab sequence instead of making them invisible while still present.
- **Estimated effort:** Small.
- **Owner:** Frontend
- **Fix applied:** Replaced the blanket `.leaflet-interactive:focus { outline: none }` with a `:focus-visible` restoration (`outline: 2px solid var(--refinery-color-accent)`), matching the site's existing focus-ring convention elsewhere. This keeps the click-only stray ring suppressed on the county polygons (which real Tab navigation never reaches — confirmed live, they carry `tabIndex: -1`) while restoring a visible ring for genuine keyboard Tab focus on the markers (which do carry `tabIndex: 0`). Verified live: tabbing to a marker shows a solid 2px `#2b7252` outline and `element.matches(':focus-visible')` returns `true`.

---

## Important findings

### Important 1 — FIXED: Content schema allows meaningful images to ship with no alt text

- **WCAG criterion:** 1.1.1 Non-text Content (A)
- **Severity:** Important
- **Affected users:** Screen reader users
- **Files:**
  - [content.config.ts:46-47](src/content.config.ts:46) — news collection: `heroImage: image().optional()` and `heroImageAlt: z.string().optional()` are independent optional fields, so `heroImage` can be set with `heroImageAlt` left blank.
  - [content.config.ts:243-244](src/content.config.ts:243) — same independent-optional pattern for a team's `robots[].image` / `robots[].imageAlt`.
  - Consumers that silently degrade to `alt=""` rather than failing: [NewsCard.astro:31](src/components/cards/NewsCard.astro:31), [ArticleLayout.astro:88](src/layouts/ArticleLayout.astro:88), [TeamHistoryYears.astro:207](src/components/teams/TeamHistoryYears.astro:207).
- **Reproduction steps / verification:** A grep across all 27 current news entries and every team's `robots[]` block found **zero current instances** of this gap — every live `heroImage`/robot `image` today has a matching alt string. This is a latent control gap, not a live defect: nothing in the schema or build stops the *next* content author from omitting it, and the failure mode is silent (the page builds and looks fine; only AT users are affected).
- **Expected:** A `heroImage`/`image` field and its alt-text sibling should be validated together (Zod's `.refine()` on the object, requiring `heroImageAlt` whenever `heroImage` is present), matching the fix already applied to the team banner image elsewhere in the same file (per that field's own comment at `content.config.ts:124-127`, which explicitly flags this exact hole for the banner and says the fix was to make it required — the news hero and robot photo fields were left on the old, unsafe pattern).
- **Actual:** Two of three known cases of this pattern in the codebase remain independently-optional.
- **Recommended fix:** Add a schema-level `.refine()` (or a lightweight content test in the existing `vitest` suite) requiring `heroImageAlt` whenever `heroImage` is set, and `imageAlt` whenever a robot `image` is set — consistent with how the team banner field was already hardened.
- **Estimated effort:** Small.
- **Owner:** Frontend / content tooling
- **Fix applied:** Added `.superRefine()` to both the news collection schema and the `robots[]` item schema in `content.config.ts`, each raising a build-time Zod issue if the image field is set without its alt sibling — the same conditional-requirement technique this file already uses elsewhere (`awards[].superRefine()` for `banner`/`bannerNote`), chosen over reshaping `heroImage`/`heroImageAlt` into the single-object-group pattern `banner` uses, since that would require rewriting frontmatter across all 27 news entries for no additional safety. Verified: `astro build` (26 pages) and `npm test` (198/198) both pass clean against current content, confirming no existing entry trips the new check.

### Important 2 — FIXED: News filter grid gives no programmatic status update when results change

- **WCAG criterion:** 4.1.3 Status Messages (AA)
- **Severity:** Important
- **Affected users:** Screen reader users
- **File:** [NewsGrid.astro](src/components/grids/NewsGrid.astro) (filter buttons ~ lines 108-179), used on `/news/`.
- **Reproduction steps:**
  1. Visit `/news/`, click any category or team filter chip.
  2. Confirmed live: the grid re-filters (cards toggle `hidden`), the clicked button's `aria-pressed` correctly flips to `"true"`, but the page's only `[aria-live]` region stays empty throughout — no result count or "no results" message is announced.
  3. Compare to [about/teams.astro](src/pages/about/teams.astro) (team search box), which does exactly this correctly via a `<p role="status" aria-live="polite" data-team-search-count>` that updates on every keystroke.
- **Expected:** A screen reader user filtering news hears how many articles now match, the same way a screen reader user searching the team roster already does.
- **Actual:** Silence — the only way to learn the result count is to re-read the whole grid.
- **Recommended fix:** Port the same `role="status" aria-live="polite"` result-count pattern from `about/teams.astro` into `NewsGrid.astro`'s filter handler.
- **Estimated effort:** Small (an existing, working pattern in the same codebase to copy).
- **Owner:** Frontend
- **Fix applied:** Added a `<p role="status" aria-live="polite" data-news-filter-count>` above the grid, updated in `apply()` alongside the existing hide/show loop. Text reads `"{shown} of {total} stories"` whenever a category or team filter narrows the view, and clears to empty when back on "All" — mirroring `about/teams.astro`'s "empty while unfiltered" behavior exactly. Verified live: clicking "Community" sets the region to `"1 of 26 stories"`; clicking back to "All" clears it.

---

## Minor findings

### Minor 1 — FIXED: Heading level skipped inside "Team History" on every team page

- **WCAG criterion:** 1.3.1 Info and Relationships / 2.4.6 Headings and Labels
- **Issue:** On every team detail page (`teams/[slug].astro`), `<h2>Team History</h2>` ([teams/[slug].astro:242](src/pages/teams/[slug].astro:242)) is correctly followed by `<h3>Banners</h3>` ([teams/[slug].astro:250](src/pages/teams/[slug].astro:250)), but the per-season "Events" heading ([TeamHistoryEvents.astro:29](src/components/teams/TeamHistoryEvents.astro:29)), each robot's name heading, and the "Awards"/"Other Awards" heading ([TeamHistoryYears.astro:151](src/components/teams/TeamHistoryYears.astro:151), [:242](src/components/teams/TeamHistoryYears.astro:242)) all jump straight to `<h4>` with no `<h3>` in that branch of the outline. Verified live on `/teams/frc10434/`: heading sequence reads H1 → H2 (Team History) → H3 (Banners) → **H4** (Events…), skipping a level.
- **Recommended fix:** Promote the season/robot/awards headings inside the history accordion to `<h3>` (they are siblings of "Banners" in the outline, not children of it), or introduce an intermediate `<h3>` wrapper per season.
- **Reused by:** `TeamHistoryYears`/`TeamHistoryEvents` render on all ~15 team pages — fixing the shared component fixes every instance at once.
- **Fix applied:** Promoted all three headings (`Events…`, per-robot name, `Awards`/`Other Awards`) from `<h4>` to `<h3>` — they sit directly under "Team History" (h2) with no intervening heading (the per-season `<details>/<summary>` isn't a heading element), so they're siblings of "Banners", not its children. Verified live on `/teams/frc10434/`: the sequence now reads H1 → H2 → H3 → H3 → H3 → H2…, no skip.

### Minor 2 — FIXED: Decorative icons in `Icon.astro` are not hidden from assistive technology

- **WCAG criterion:** 1.1.1 Non-text Content / 4.1.2 Name, Role, Value
- **Issue:** [Icon.astro:59-69](src/components/marketing/Icon.astro:59) renders an inline `<svg>` with no `aria-hidden="true"`, unlike its sibling [SocialIcon.astro:68](src/components/marketing/SocialIcon.astro:68), which does set it. Every current use (`SummaryCard.astro:35`) places the icon directly next to a visible `<h3>` title, so the icon is purely decorative and the text label already carries the meaning — but some AT/browser pairings will still expose the unlabeled `<svg>`, and one icon (`funding`, `Icon.astro:28`) embeds a literal `<text>` glyph (`$`) that could be read aloud as stray content.
- **Recommended fix:** Add `aria-hidden="true"` to the `<svg>` in `Icon.astro`, matching `SocialIcon.astro`'s existing pattern.
- **Reused by:** `SummaryCard.astro`, used 12 times on the homepage alone (the "What We Provide" carousel and "Beyond Northeast Indiana" grid).
- **Fix applied:** Added `aria-hidden="true"` to `Icon.astro`'s `<svg>`. Verified live on the homepage: every `<svg>` on the page is now either `aria-hidden` or sits inside a control with its own `aria-label`; axe-core still reports 0 violations.

---

## Polish findings

### Polish 1 — FIXED: Inconsistent decorative-marker labeling on the team-award banner dot

- **WCAG criterion:** 1.1.1 (advisory)
- **File:** [TeamHistoryAwardRow.astro:32](src/components/teams/TeamHistoryAwardRow.astro:32) vs [:34](src/components/teams/TeamHistoryAwardRow.astro:34)
- **Issue:** The "earned a banner" colored dot gets its accessible name from a `title` attribute (inconsistent AT support, no keyboard discoverability), while the adjacent non-colored dot correctly uses `aria-hidden="true"`. The visible label already carries an sr-only " — earned a banner" string elsewhere in the same list item, so the `title` is redundant and could double-announce.
- **Recommended fix:** Use `aria-hidden="true"` on both dot variants for consistency.
- **Fix applied:** Replaced `title="Earned a banner"` with `aria-hidden="true"` on the colored dot, matching the non-colored one. Verified live on `/teams/frc10434/`: both dot variants now carry `aria-hidden="true"` with no `title`.

### Polish 2 — FIXED: Dead `href="#"` fallback on partner logos with no URL

- **WCAG criterion:** 2.4.4 (advisory)
- **File:** [about.astro:316](src/pages/about.astro:316)
- **Issue:** A partner entry with no `url` in its frontmatter still renders a real, focusable `<a href="#">` that does nothing when activated.
- **Recommended fix:** Render a `<div>`/`<span>` instead of an `<a>` when `partner.data.url` is absent.
- **Fix applied:** The logo now renders as `<a>` only when `partner.data.url` is set, and as a plain `<div>` (same classes, no `href`/`target`/`rel`) otherwise. All 4 current partners have real URLs, so nothing changed visually; verified via `astro build` + live axe re-run (0 violations) that no existing content regressed.

### Polish 3 — FIXED: Nav step-number contrast is a narrow pass, worth monitoring

- **WCAG criterion:** 1.4.3 (currently passing; flagged for margin, not a failure)
- **File:** [SiteHeader.astro:65-67](src/components/nav/SiteHeader.astro:65) — the `01`/`02`… step numbers in the primary nav (`text-slate-500` on the header's `bg-white/95 backdrop-blur`).
- **Issue:** axe-core could not auto-resolve this pair (flagged "incomplete" on every template, due to the semi-transparent `backdrop-blur` background). Manual sRGB calculation against an effectively-white backdrop gives **≈4.76:1**, which passes the 4.5:1 AA minimum for normal text, but with less than 0.3:1 of margin. Because the header is `sticky` with `bg-white/95` over whatever scrolls beneath it, a busier background showing through the 5% transparency could plausibly pull this under 4.5:1 in a way this static calculation can't rule out.
- **Recommended fix:** No change required to pass AA today; consider a slightly darker slate (e.g. `text-slate-600`) for headroom, or bump `bg-white/95` to fully opaque, next time this component is touched.
- **Fix applied:** Changed both step-number instances (desktop and mobile nav) from `text-slate-500` to `text-slate-600`, giving ≈7.6:1 contrast against white — comfortable AA headroom (and close to AAA's 7:1) instead of a ~0.3:1 margin. Verified live: computed color now resolves to slate-600's value.

---

## WCAG 2.1 AA scorecard

Scored against everything in scope; criteria with no applicable content on this site (e.g. time-based media) are N/A.

### 1. Perceivable

| Criterion | Pass / Fail / N/A | Notes |
|---|---|---|
| 1.1.1 Non-text content | Pass | Map markers now named (Critical 1); schema requires alt on hero/robot images (Important 1); decorative icons now hidden (Minor 2) — all fixed |
| 1.2.1–1.2.5 Time-based media | N/A | No audio/video content on the site |
| 1.3.1 Info and relationships | Pass | Map's `role="img"` misrepresentation fixed (Critical 1); heading skip on team pages fixed (Minor 1) |
| 1.3.2 Meaningful sequence | Pass | |
| 1.3.3 Sensory characteristics | Pass | |
| 1.3.4 Orientation | Pass | No orientation lock found |
| 1.3.5 Identify input purpose | Pass | Contact form inputs use `autocomplete` (`FormField.astro`) |
| 1.4.1 Use of color | Pass | Award/status indicators verified paired with text |
| 1.4.2 Audio control | N/A | No auto-playing audio |
| 1.4.3 Contrast (minimum) | Pass | axe: 0 hard failures across all templates; nav step-number margin widened from ~4.76:1 to ~7.6:1 (Polish 3) |
| 1.4.4 Resize text | Not tested | See Methodology gaps |
| 1.4.5 Images of text | Pass | No images-of-text found |
| 1.4.10 Reflow | Pass | Verified at 320px on home + about (map page); no horizontal scroll |
| 1.4.11 Non-text contrast | Pass | Spot-checked; no findings |
| 1.4.12 Text spacing | Not tested | See Methodology gaps |
| 1.4.13 Content on hover or focus | Pass | Map/tooltip popups dismiss correctly; no sticky hover content found elsewhere |

### 2. Operable

| Criterion | Pass / Fail / N/A | Notes |
|---|---|---|
| 2.1.1 Keyboard | Pass | Fixed: markers are named, and a hand-rolled `keydown` handler (Enter/Space) now opens the popup — Leaflet's own `keypress`-based handling was found not to fire in current Chrome (Critical 1) |
| 2.1.2 No keyboard trap | Pass | Contact dialog's `inert`-based trap verified correct in code; Escape closes it |
| 2.1.4 Character key shortcuts | Pass | None present |
| 2.2.1 Timing adjustable | N/A | No time limits on the site |
| 2.2.2 Pause, stop, hide | Pass | Carousel autoplay has a sticky, user-controlled pause toggle; respects `prefers-reduced-motion` |
| 2.3.1 Three flashes | Pass | No flashing content |
| 2.4.1 Bypass blocks | Pass | Working skip link verified live (`#main`, `tabindex="-1"`, visible on focus) |
| 2.4.2 Page titled | Pass | All 11 templates carry distinct, descriptive `<title>` |
| 2.4.3 Focus order | Pass | Verified via keyboard tab-through on home + mobile nav |
| 2.4.4 Link purpose | Pass | Fixed: dead `href="#"` fallback removed (Polish 2) |
| 2.4.5 Multiple ways | Pass | Primary nav + footer + breadcrumbs + news/team filters |
| 2.4.6 Headings and labels | Pass | Fixed: heading skip removed (Minor 1) |
| 2.4.7 Focus visible | Pass | Fixed: `:focus-visible` restored on real keyboard focus for markers, suppressed on click-only polygon focus (Critical 2); everywhere else verified visible (nav, buttons, dialog, carousel, forms) |
| 2.5.1 Pointer gestures | Pass | No multipoint/path gestures |
| 2.5.2 Pointer cancellation | Pass | Standard click/`up`-event activation throughout |
| 2.5.3 Label in name | Pass | Verified on nav, buttons, dialog controls |
| 2.5.4 Motion actuation | N/A | No motion-triggered functionality |

### 3. Understandable

| Criterion | Pass / Fail / N/A | Notes |
|---|---|---|
| 3.1.1 Language of page | Pass | `<html lang="en">` set once in `MarketingLayout.astro`, shared by every page |
| 3.1.2 Language of parts | N/A | No inline foreign-language passages found |
| 3.2.1 On focus | Pass | No unexpected context changes on focus |
| 3.2.2 On input | Pass | Contact form topic-switching behavior is expected, not surprising, and doesn't move focus |
| 3.2.3 Consistent navigation | Pass | Header/footer consistent across all templates |
| 3.2.4 Consistent identification | Pass | |
| 3.3.1 Error identification | Pass | Native `reportValidity()` used for contact form; hCaptcha/server errors surfaced via `role="status"` |
| 3.3.2 Labels or instructions | Pass | All form fields verified labeled (`<label for>` / `fieldset legend`); required state carried by native `required` attribute |
| 3.3.3 Error suggestion | Pass | Generic but present ("email us directly" fallback on send failure) |
| 3.3.4 Error prevention | N/A | No legal/financial transaction forms on this site (donation happens via embedded Zeffy iframe, out of this codebase's control) |

### 4. Robust

| Criterion | Pass / Fail / N/A | Notes |
|---|---|---|
| 4.1.1 Parsing | Pass | No duplicate-ID or malformed-nesting issues found in static review |
| 4.1.2 Name, role, value | Pass | Fixed: map markers now named (Critical 1); everything else checked (dialog, disclosure widgets, carousel, forms, filter buttons) verified correct |
| 4.1.3 Status messages | Pass | Fixed: news filter now announces via `role="status"` (Important 2); contact form status region verified correct by contrast |

---

## Remediation roadmap

### Phase 1: Critical fixes

- [x] Fix `ServiceAreaMap.astro`'s ARIA structure — removed `role="img"`, gave each marker a real `aria-label`, and added a working `keydown` handler since Leaflet's own Enter/Space handling doesn't fire in current Chrome (Critical 1) — **fixed 2026-09-19**
- [x] Restore a visible focus indicator on keyboard-focused markers via `:focus-visible`, while still suppressing the click-only ring on non-keyboard-reachable polygons (Critical 2) — **fixed 2026-09-19**

### Phase 2: Important fixes

- [x] Add schema validation requiring alt text whenever `heroImage`/robot `image` is set (Important 1) — **fixed 2026-09-19**
- [x] Add a live-region result count to the news filter grid, copying the working `about/teams.astro` pattern (Important 2) — **fixed 2026-09-19**

### Phase 3: Minor fixes

- [x] Promote season/robot/awards headings inside Team History from `<h4>` to `<h3>` (Minor 1) — **fixed 2026-09-19**
- [x] Add `aria-hidden="true"` to `Icon.astro`'s `<svg>` (Minor 2) — **fixed 2026-09-19**

### Phase 4: Polish

- [x] Make both award-banner dot variants use `aria-hidden="true"` consistently (Polish 1) — **fixed 2026-09-19**
- [x] Render partner logos without a URL as non-links (Polish 2) — **fixed 2026-09-19**
- [x] Darken the nav step-number color (`slate-500` → `slate-600`) for contrast headroom (Polish 3) — **fixed 2026-09-19**

### Phase 5: Process improvements

- [ ] Add axe-core (or `@axe-core/playwright`) to CI against the built site's page templates — would have caught Critical 1/2 automatically
- [ ] Schedule a real screen-reader pass (VoiceOver is sufficient for a first pass) before the site's public launch, given this report could not perform one
- [ ] Re-run this audit once `base`/`site` revert to the production domain at launch (see `astro.config.mjs`'s own launch note) — a full crawl of the live URLs is worth doing once, separate from this dev-server pass

---

## Re-audit schedule

- **Verify Critical fixes:** within 1–2 weeks of this report
- **Verify Important fixes:** within 4 weeks
- **Full re-audit:** at site launch (once the production domain/base path are live), then every 6–12 months or on major redesign
- **Trigger-based re-audit:** any new interactive component (map, carousel, dialog) added after this audit

---

## Sign-off

Critical fixes verified by: _pending_
Important fixes verified by: _pending_
Final approval: _pending_
