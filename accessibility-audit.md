# Accessibility Audit — The REFINERY

**Target standard:** WCAG 2.1 Level AA
**Scope:** Full public site (11 routes) as served by `astro dev` on `localhost:4321`
**Date:** 2026-08-17
**Commit:** `ccc9e7a` (branch `main`, clean tree)

---

## 1. Executive summary

The site is built on genuinely good foundations. Semantic HTML is used throughout, every image
carries an `alt`, landmarks and `lang` are correct, `prefers-reduced-motion` is honored in three
separate systems, and the contact dialog hand-rolls focus management (initial focus, `inert`
background, focus restore) more carefully than most production sites. There are **no unlabeled
form controls, no keyboard traps, no empty links, and no missing alt text anywhere on the site.**

The findings are concentrated in two places:

1. **Color contrast.** The brand accent `#40a578` does not carry text at AA on any of the site's
   backgrounds. This is not a handful of stray elements — it is the primary CTA button style
   (`.btn-primary`, 2.63:1), every eyebrow tag, every "read more" affordance, every team link,
   and the site-wide Donate button in the header. Combined with `text-slate-400` metadata
   (2.63:1) and the footer disclaimer (3.8:1), **automated scanning found 214 contrast
   violations across 9 pages.** Every one traces back to four token/utility decisions, so the
   remediation is small even though the finding count is large.

2. **Dynamic-state announcement and a few structural gaps.** The contact form's success state is
   invisible to screen readers, the donation `<iframe>` has no accessible name, the homepage
   carousel auto-scrolls with no pause control, and the homepage `<h1>` is visibly clipped at a
   320px viewport.

**Findings: 0 Critical (P0), 6 Important (P1), 4 Minor (P2), 4 Polish (P3).**

> **Status update — 2026-08-17.** All three remediation phases are complete.
> **All 16 findings are fixed and verified** — every P0/P1/P2/P3 item, plus the carousel pause
> control. An axe sweep across all 9 public routes plus a sampled MDX article page returns
> **zero violations of any rule** (from 236 originally). The only work left in this document is
> the verification gaps recorded in §12 (real screen-reader testing).
>
> **One audit finding was wrong and is corrected below: P1.6.** Its prescribed fix — "add a `title`
> to the Zeffy iframe" — would have been a no-op. See the entry for what was actually required.

Nothing found completely blocks a user flow, which is why there are no P0s. The P1 set is,
however, enough to fail an AA conformance claim today, and the contrast issues sit directly on
the donate and contact conversion paths.

---

## 2. Methodology

### What was run

| Stage | Tool / method | Coverage |
|---|---|---|
| Automated scan | axe-core 4.10.2, injected per page | 9 routes, full-page |
| Contrast math | Independent WCAG 2.x relative-luminance calculation of design tokens | `src/styles/tokens.css` |
| Keyboard | Manual `Tab` traversal, focus-indicator inspection, dialog open/close/Esc/restore | Home, contact dialog |
| Programmatic DOM | Accessible-name, landmark, heading-order, `alt`, `target=_blank`, `iframe title` extraction | 11 routes |
| Visual / reflow | Viewport 320×800 and 1280×800, overflow + clipping detection, screenshots | 11 routes |
| Text spacing (1.4.12) | WCAG-specified spacing overrides injected, re-measured for clipping/overflow | Home |
| Reduced motion | Source review of all three motion systems + computed-style verification | Site-wide |
| Source review | All layouts, nav, forms, cards, carousel, plugins, `marketing.css`, `tokens.css` | Site-wide |

### Routes tested

`/` · `/what-we-do/` · `/programs-events/` · `/programs-events/amp-lab/` · `/news/` ·
`/news/[article]/` · `/get-involved/` · `/about/` · `/about/teams/` · `/donate/` · `/404`

### Methodology note worth recording

The first automated pass **under-reported by roughly 3×**. Cards carry `data-reveal` and start at
`opacity: 0` until `IntersectionObserver` fires; in an offscreen scanning frame it never fires, so
axe correctly skipped them as invisible. Every scan reported here was re-run with
`js-reveal` removed and `.is-revealed` forced on all `[data-reveal]` elements. **Any future
automated scanning of this site must do the same, or it will silently miss every card grid.**

### Gaps — what was NOT verified

Per this audit's data-availability rule, these are stated rather than estimated:

- **Screen reader testing was attempted and could not be completed.** A full VoiceOver
  automation harness was built and run (Guidepup 0.33.2 + Safari 26.5.2 on macOS 26.5.2).
  VoiceOver started successfully and accepted navigation commands, but **macOS 26 no longer
  responds to the two AppleScript calls the harness depends on** — see §12 for the raw evidence.
  No spoken output could be captured. Stage 3 therefore did not produce data. Accessible names,
  roles, and states were verified programmatically instead (axe name-computation plus direct DOM
  inspection), which confirms the markup is correct but **does not confirm how any screen reader
  voices it.** See §12 for exactly which findings this does and does not affect.
- **No color-blindness simulation was run.** Deuteranopia/protanopia checks were not performed.
- **No reading-level measurement.** No Flesch-Kincaid or equivalent score was computed; the
  cognitive-accessibility notes below are qualitative observations only.
- **The production build was not scanned.** All testing was against the dev server. Astro's dev
  and build output differ in image handling and CSS ordering; a confirmation pass against
  `npm run build && npm run preview` is recommended before any formal conformance claim.
- **Third-party embeds were not audited internally.** The Zeffy donation form, Google Calendar
  embed, and hCaptcha widget are vendor-controlled. Only their integration into this site
  (naming, containment) was assessed.

---

## 3. Findings by WCAG principle

### Perceivable

| Criterion | Level | Result |
|---|---|---|
| 1.1.1 Non-text Content | A | **Pass.** All 24 images across tested pages have `alt`. Decorative texture layer is `aria-hidden`. Icon-only buttons carry `aria-label`. |
| 1.2.x Time-based Media | A/AA | **N/A.** No audio or video content. |
| 1.3.1 Info and Relationships | A | **Fail** — heading order on `/news/` (see 3.2). Elsewhere passes: real `<fieldset>/<legend>`, `<time datetime>`, `<ol>` breadcrumbs. |
| 1.3.2 Meaningful Sequence | A | Pass. DOM order matches visual order on all tested pages. |
| 1.3.4 Orientation | AA | Pass. No orientation lock. |
| 1.3.5 Identify Input Purpose | AA | Pass. `autocomplete` is wired through `FormField.astro`. |
| 1.4.1 Use of Color | A | **Fail** — inline text link and active nav state (see 1.5, 3.3). |
| 1.4.3 Contrast (Minimum) | AA | **Fail** — 214 violations (see 1.1–1.4). |
| 1.4.4 Resize Text | AA | Pass. |
| 1.4.10 Reflow | AA | **Fail** — homepage `<h1>` clipped at 320px (see 1.6). All other pages pass with no horizontal scroll. |
| 1.4.11 Non-text Contrast | AA | Pass. Focus ring `#40a578` on white is 3.06:1 (threshold 3:1). Passing, but with almost no margin — see P3.4. |
| 1.4.12 Text Spacing | AA | **Pass.** WCAG spacing overrides applied; no clipping or horizontal scroll. |
| 1.4.13 Content on Hover | AA | Pass. No hover-triggered persistent content. |

### Operable

| Criterion | Level | Result |
|---|---|---|
| 2.1.1 Keyboard | A | Pass. All functionality reachable and operable by keyboard, including the carousel (`tabindex="0"` scroll region + real `<button>` controls) and the `<details>` mobile menu. |
| 2.1.2 No Keyboard Trap | A | Pass. Dialog uses `inert` on `header`/`main`/`footer` — verified `inert` is applied on open and removed on close. Esc closes. |
| 2.2.1 Timing Adjustable | A | Pass. No time limits. |
| 2.2.2 Pause, Stop, Hide | A | **Fail** — carousel autoplay (see 1.7). |
| 2.3.1 Three Flashes | A | Pass. |
| 2.4.1 Bypass Blocks | A | **Marginal** — no skip link (see 2.4). Landmarks are present and correct, which is a sufficient technique (ARIA11), so this is not a clean failure — but sighted keyboard users have no bypass. |
| 2.4.2 Page Titled | A | Pass. Unique, descriptive `<title>` on every route. |
| 2.4.3 Focus Order | A | **Fail** — focus lands on a `display:none` element after form success (see 2.1). Otherwise logical. |
| 2.4.4 Link Purpose | A | Pass. No "click here"/"read more" bare links; no empty links. |
| 2.4.5 Multiple Ways | AA | Pass. Primary nav, footer nav, breadcrumbs, sitemap. |
| 2.4.6 Headings and Labels | AA | Pass. |
| 2.4.7 Focus Visible | AA | Pass. Verified by real `Tab` traversal — author ring (2px `#40a578`, 3px offset) on `.btn`/`.card-link`/`.form-input`, UA default elsewhere. No `outline: none` anywhere in the codebase. |
| 2.5.1–2.5.4 Pointer | A | Pass. No path-based gestures, no motion actuation. |
| 2.5.3 Label in Name | A | Pass. |

### Understandable

| Criterion | Level | Result |
|---|---|---|
| 3.1.1 Language of Page | A | Pass. `<html lang="en">`. |
| 3.1.2 Language of Parts | AA | Pass. No foreign-language passages found. |
| 3.2.1 On Focus | A | Pass. |
| 3.2.2 On Input | A | Pass. Topic-change rewrites dialog content, but the dialog is already open and focused — not a context change in the 3.2.2 sense. |
| 3.2.3 Consistent Navigation | AA | Pass. |
| 3.2.4 Consistent Identification | AA | Pass. |
| 3.3.1 Error Identification | A | Pass, via native constraint validation (`reportValidity()`). See P3.3 for a latent inconsistency. |
| 3.3.2 Labels or Instructions | A | Pass. Every control has a `<label for>` or `<legend>`; `aria-describedby` wires hints. |
| 3.3.3 Error Suggestion | AA | Pass (native browser messages). |
| 3.3.4 Error Prevention | AA | N/A — no legal/financial commitment handled on-site (donation is delegated to Zeffy). |

### Robust

| Criterion | Level | Result |
|---|---|---|
| 4.1.2 Name, Role, Value | A | **Fail** — donation `<iframe>` has no accessible name (see 1.8). Everything else passes; axe found zero name/role/value violations across 9 pages, including inside the open contact dialog. |
| 4.1.3 Status Messages | AA | **Fail** — form success is not announced (see 2.1). The error path *is* correct (`role="status" aria-live="polite"`). |

---

## 4. Critical findings (P0)

**None.** No finding blocks an entire user flow or renders a key page completely inaccessible.

---

## 5. Important findings (P1)

### P1.1 — Primary CTA button fails AA contrast at 2.63:1

**WCAG:** 1.4.3 Contrast (Minimum), AA
**Where:** `src/styles/marketing.css:293` (`.btn-primary`); `src/components/nav/SiteHeader.astro:60` (header Donate)
**Measured:** `#eeeeee` on `#40a578` = **2.63:1**. Required: 4.5:1.

This is the site's main call-to-action treatment. Every instance is affected: the header Donate
button on all 11 pages, "Explore What We Do", "Get Involved", "Talk With Us About Starting a
Team", "Back to home" on `/404`, and the team-card featured badge.

**Fix:** `.btn-primary` currently sets `color: var(--color-brand-light)` (`#eeeeee`) on
`background-color: var(--color-brand-accent)`. Two viable routes:
- Darken the accent for button surfaces to roughly `#2f7d59` or darker, keeping `#eeeeee` text
  (reaches ≈4.6:1); or
- Keep `#40a578` and swap the text to `var(--color-brand)` `#134b70` — measured **3.03:1**, still
  failing, so this route requires darkening the background regardless.

Recommended: introduce a `--refinery-color-accent-dark` token for text-bearing accent surfaces and
leave `#40a578` for non-text use (borders, focus rings, icons), where 3:1 is the bar and it passes.

---

### P1.2 — Brand accent used as text color fails AA in 4 contexts (≈150 instances)

**WCAG:** 1.4.3 Contrast (Minimum), AA
**Measured:**

| Context | Foreground | Background | Ratio | Required |
|---|---|---|---|---|
| Card "read more" links, team links, `via <source>` labels | `#40a578` | `#ffffff` | **3.05:1** | 4.5:1 |
| `.eyebrow-tag`, section numbers, role labels, inline body links | `#40a578` | `#f7f9fa` | **2.89:1** | 4.5:1 |

**Where:** `text-brand-accent` utility, applied in `NewsCard.astro:66`, `TeamCard`, `PeopleBios`,
`SummaryCard`, `about.astro`, `get-involved.astro`, `what-we-do.astro`, `programs-events.astro`.
Highest concentrations: `/about/teams/` (27 instances), `/news/` (24), `/about/` (12).

**Fix:** Same root cause as P1.1. Once a darker accent token exists, retarget the
`text-brand-accent` utility to it. Note `#40a578` is fine as text **on the dark surface**
(`#232326`) at 5.13:1 — only light-background usage fails.

---

### P1.3 — Metadata text at 2.63:1 (30+ instances per page on card grids)

**WCAG:** 1.4.3 Contrast (Minimum), AA
**Measured:** `text-slate-400` `#90a1b9` on `#ffffff` = **2.63:1**. Required: 4.5:1 (11.2px text).

**Where:** `NewsCard.astro:47` (publication dates), `TeamCard` program labels, `SiteHeader.astro:39`
(nav numerals `01`–`06`). 30 instances on `/about/teams/`, 25 on `/news/`.

**Fix:** Move to `text-slate-500` (`#62748e`, **4.86:1** on white) — a one-token change that clears AA.
`text-slate-600` (7.58:1) if more headroom is wanted.

---

### P1.4 — Footer disclaimer at 3.8:1 on every page

**WCAG:** 1.4.3 Contrast (Minimum), AA
**Measured:** `#71717b` (`text-zinc-500`) on `#e4e4e7` (`bg-zinc-200`) = **3.8:1** at 12px. Required: 4.5:1.
**Where:** `src/components/nav/SiteFooter.astro:59`, inside `<footer class="… bg-zinc-200">` (line 8).

This is the *FIRST®* trademark disclaimer — legally meaningful text, present on all 11 pages, and
the least readable text on the site.

**Fix:** `text-zinc-600` (`#52525c`) on `bg-zinc-200` gives **6.0:1**.

---

### P1.5 — Contact form success is never announced, and focus lands on a hidden element

**WCAG:** 4.1.3 Status Messages (AA); 2.4.3 Focus Order (A)
**Where:** `src/components/forms/ContactDialogs.astro:293-295`; `src/components/forms/FormDialog.astro:76`

On successful submit the code does:

```js
form.classList.add('hidden');
success.classList.remove('hidden');
success.classList.add('flex');
```

The `[data-form-success]` panel has **no `role`, no `aria-live`, and no `tabindex`** (verified in
the live DOM). Nothing moves focus into it. Meanwhile the `<p role="status" aria-live="polite">`
element that *would* announce is left empty on the success path — it is only used for errors.

Verified in-browser: with focus on the submit button, applying the success swap leaves
`document.activeElement` on the submit button while its `offsetParent` is `null` — i.e. focus sits
on a `display:none` element. The focus ring is invisible and the next `Tab` restarts from the
document.

A screen reader user submits the form and receives no confirmation that anything happened.

**Fix:** Move focus to the success panel and let it announce:

```js
success.setAttribute('role', 'status');
success.setAttribute('tabindex', '-1');
// after the class swap:
success.focus();
```

The existing `close` handler already resets `tabindex`-free state correctly, so no teardown change
is needed beyond removing the attribute if you prefer not to leave it in the DOM.

**Caveat:** this finding is derived from DOM state and code, not from heard screen-reader output —
see the gaps in §2. The missing live region is unambiguous from the markup; the exact announcement
behavior should be confirmed with NVDA and VoiceOver.

---

### P1.6 — Donation form `<iframe>` has no accessible name

**WCAG:** 4.1.2 Name, Role, Value (A); 2.4.1 Bypass Blocks (A)
**Where:** `src/pages/donate.astro` — the `[data-zeffy-embed]` container
**Confirmed by:** axe rule `frame-title`, serious impact.

The Zeffy donation embed — the entire donation mechanism — renders as an unnamed frame. A screen
reader announces "frame" with no indication of what it contains or that entering it is how you
donate.

Notably, the *other* embeds on the site are done correctly: the Google Calendar iframe on
`/programs-events/` has `title="The REFINERY events calendar"`, the map on `/about/` is titled, and
hCaptcha supplies its own.

> **Correction (2026-08-17).** This finding originally prescribed "add a `title` attribute to the
> iframe at `donate.astro:57`". **That would have been a no-op.** That iframe already carried
> `title="Donation form powered by Zeffy"` — but it sits inside a `display:none` fallback wrapper
> that only activates if Zeffy's script fails to load, so it was never the element axe was
> reporting.
>
> The live DOM contains **three** iframes, and the unnamed one is **injected at runtime** by
> `zeffy-embed.js` into `<div data-zeffy-embed>`. It does not exist in this repository and cannot
> be given a title in markup.
>
> **Actual fix:** a `MutationObserver` in `donate.astro` that names the injected frame once it
> appears. It only sets a title when none is present (so a future Zeffy release that names its own
> frame wins), disconnects on the first hit, and gives up after 15s. Verified in Safari: the
> injected iframe now reports `title="Donation form"`.
>
> The general lesson: for a third-party embed, the element axe reports may not be the element in
> your source. Check the rendered DOM before writing the fix.

---

### P1.7 — Homepage carousel auto-scrolls with no pause control

**WCAG:** 2.2.2 Pause, Stop, Hide, **Level A**
**Where:** `src/components/marketing/Carousel.astro:130-176`; used on `src/pages/index.astro`

The carousel drives continuous horizontal auto-scroll at 20px/second via `requestAnimationFrame`,
indefinitely. It pauses on `pointerenter` and `focusin`, and — to the team's credit — is disabled
entirely under `prefers-reduced-motion: reduce`.

Hover and focus pause are not a sufficient 2.2.2 mechanism: the criterion requires a mechanism for
the user to pause, and hover-pause is undiscoverable, unavailable to touch users, and unavailable
to anyone who does not happen to put a pointer on it. Motion lasting more than 5 seconds alongside
other content needs an explicit control.

**Fix:** Add a pause/play toggle button next to the existing prev/next controls, with an
`aria-label` that reflects state ("Pause automatic scrolling" / "Resume automatic scrolling") and
a flag that suppresses the rAF loop while paused. The existing `interactionPaused` mechanism gives
you most of this — it needs a sticky variant that does not auto-resume after 3 seconds.

---

### P1.8 — Homepage `<h1>` is visually clipped at a 320px viewport

**WCAG:** 1.4.10 Reflow, AA
**Where:** `src/pages/index.astro` hero — `<section class="relative overflow-hidden">`

**Measured at 320×800:** the `<h1>` renders at `font-size: 48px` (`text-5xl`, with no smaller
breakpoint below `sm`), producing a **413px-wide** box inside a 320px viewport. The ancestor
`<section>` carries `overflow-x: hidden`, so instead of causing page scroll it **silently truncates
the text.** Screenshot confirms the word "infrastructure" renders as "infrastructur" with the
final letter cut off.

Because the clipping ancestor suppresses horizontal scroll, the page looks like it passes reflow —
`document.scrollWidth` is exactly 320. The content loss is real regardless.

This is the only clipping instance on the site; all 10 other routes pass cleanly at 320px, and
1.4.12 Text Spacing passes site-wide.

**Fix:** Start the heading smaller and scale up — e.g. `text-4xl sm:text-5xl` — or add
`hyphens: auto` / `overflow-wrap: break-word` to the hero heading.

---

## 6. Minor findings (P2)

### P2.1 — Inline body link distinguished by color alone
**WCAG:** 1.4.1 Use of Color, **Level A** · axe rule `link-in-text-block`
**Where:** `src/pages/get-involved.astro` — `<a class="text-brand-accent hover:underline">the teams we support</a>`

Inside a paragraph, this link is `#40a578` against `#f7f9fa` body text. Underline appears only on
hover. 1.4.1 requires either a non-color distinction or ≥3:1 contrast *against the surrounding
text* — the measured ratio against the body copy does not meet that.

**Fix:** `underline` by default rather than on hover. Fixing P1.2's contrast alone does not clear
this criterion.

### P2.2 — Heading order skips from `<h1>` to `<h3>` on the news index
**WCAG:** 1.3.1 Info and Relationships, A · axe rule `heading-order`
**Where:** `src/pages/news/index.astro` + `src/components/cards/NewsCard.astro:64`

`/news/` renders `<h1>` then 25 consecutive `<h3>` card titles with no `<h2>` between. Note that
`/about/teams/` gets this right (`h1` → `h2` section → `h3` cards) — the pattern exists in the
codebase already.

**Fix:** Either add a visually-hidden `<h2>` above the grid, or demote `NewsCard`'s title to `<h2>`
on this page via a prop. Do not change `NewsCard` globally — it is also used in `<h3>`-correct
contexts on the homepage.

### P2.3 — No skip link
**WCAG:** 2.4.1 Bypass Blocks, A
**Where:** `src/layouts/MarketingLayout.astro`

Verified: no in-page anchor exists anywhere on the site. Every page begins with a logo link plus 6
nav links plus Donate — 8 tab stops — before `<main>`.

Landmarks *are* present and correct (`<header>`, `<nav aria-label="Primary">`, `<main>`,
`<footer>`), and landmark navigation is a WCAG-sufficient technique (ARIA11), so this is not a
clean failure. But it only helps screen reader users. A sighted keyboard-only user — motor
impairment, switch access, no screen reader — has no way to bypass the header on any page.

**Fix:** Add `<a href="#main" class="…">Skip to main content</a>` as the first body child, visually
hidden until `:focus`, with `id="main" tabindex="-1"` on the `<main>` element.

### P2.4 — Active navigation state is conveyed by color and a decorative dash only
**WCAG:** 1.4.1 Use of Color (A); 4.1.2 Name, Role, Value (A)
**Where:** `src/components/nav/SiteHeader.astro:33-52`

Verified in the live DOM: `aria-current` is `null` on all 6 primary nav links, including the active
one. The active link differs only by text color (`text-brand-accent`) and a 12px accent dash that
is explicitly `aria-hidden="true"`.

Note the breadcrumb component gets this right — `Breadcrumbs.astro` correctly uses
`aria-current="page"` on the final crumb.

**Fix:** `aria-current={isActive ? 'page' : undefined}` on the nav anchor. Apply to the mobile nav
too, which has the same gap.

---

## 7. Polish (P3)

### P3.1 — Dialog lacks `aria-modal="true"`
`FormDialog.astro:16`. Opened with `.show()` rather than `.showModal()` (a deliberate, well-documented
choice to let the hCaptcha challenge stack correctly), so the dialog is not implicitly modal. The
`inert` allowlist genuinely isolates the background, so this is largely mitigated — but older
assistive tech that predates `inert` support will not know it is modal. Adding `aria-modal="true"`
on open and removing it on close costs two lines.

### P3.2 — New-window links carry no programmatic warning
Site-wide. External links get `target="_blank" rel="noopener noreferrer"` and a CSS `::after` arrow
(`marketing.css:80`), plus a `↗` glyph on news cards. The arrow is decorative and the accessible
name never says a new window will open. **3.2.5 is Level AAA, so this is not an AA blocker** — noted
because news cards silently send users off-site mid-flow. A visually-hidden "(opens in a new tab)"
span would close it.

### P3.3 — Unused custom error elements create a latent inconsistency
`FormField.astro` renders a `<p id="{field}-error" data-field-error>` for every field and wires it
into `aria-describedby`. Nothing in the codebase ever populates it — validation is entirely native
`reportValidity()`. Harmless today (empty `aria-describedby` targets are ignored), but it will read
as "custom validation exists" to the next person who touches this, and half-implementing it is how
3.3.1 regressions happen. Either wire it up or remove it.

### P3.4 — Focus ring passes 1.4.11 with almost no margin
`.btn:focus-visible` / `.card-link:focus-visible` use 2px `#40a578`. Against white that is
**3.06:1** against a 3:1 threshold. It passes — but any darkening of page backgrounds or lightening
of the accent breaks it. If P1.1's darker accent token lands, point the focus ring at it too and the
margin becomes comfortable.

### P3.5 — Cognitive accessibility: qualitative notes only
No reading-level score was computed (see §2 gaps). Qualitatively: instructions are clear, the
contact dialog's topic-scoped questions avoid overwhelming users with irrelevant fields, error
messages come from the browser and explain how to fix rather than only what failed, there are no
time limits, and no step depends on remembering a prior page. Nothing raised a concern; nothing was
measured.

---

## 8. Remediation roadmap

### Phase 1 — Design tokens (highest impact, smallest change)

Fixes 214 of ~224 total violations. Almost entirely edits to `tokens.css` + `marketing.css`.

| # | Fix | Files | Effort |
|---|---|---|---|
| P1.1 | Add `--refinery-color-accent-dark` (~`#2f7d59`); use for `.btn-primary` background | `tokens.css`, `marketing.css` | S |
| P1.2 | Retarget `text-brand-accent` to the dark accent on light backgrounds | `marketing.css` | S |
| P1.3 | `text-slate-400` → `text-slate-500` for card/nav metadata | `NewsCard`, `TeamCard`, `SiteHeader` | S |
| P1.4 | `text-zinc-500` → `text-zinc-600` in the footer disclaimer | `SiteFooter.astro:59` | XS |
| P3.4 | Point focus rings at the new dark accent | `marketing.css` | XS |

**Verification:** re-run axe on all 9 routes *with reveal forced visible*; expect 0 contrast violations.

### Phase 2 — Structural and dynamic-state fixes

| # | Fix | Files | Effort |
|---|---|---|---|
| P1.6 | Add `title` to the Zeffy iframe | `donate.astro:57` | XS |
| P1.8 | `text-4xl sm:text-5xl` on the hero `<h1>` | `index.astro` | XS |
| P1.5 | `role="status"` + `tabindex="-1"` + `.focus()` on the success panel | `FormDialog.astro`, `ContactDialogs.astro` | S |
| P2.3 | Skip link + `id="main" tabindex="-1"` | `MarketingLayout.astro`, `marketing.css` | S |
| P2.4 | `aria-current="page"` on active nav links (desktop + mobile) | `SiteHeader.astro` | XS |
| P2.1 | Default underline on inline body links | `get-involved.astro` | XS |
| P2.2 | Fix news-index heading level | `news/index.astro`, `NewsCard.astro` | S |

### Phase 3 — Carousel and polish

| # | Fix | Files | Effort |
|---|---|---|---|
| P1.7 | Pause/play toggle for carousel autoplay | `Carousel.astro` | M |
| P3.1 | `aria-modal="true"` on dialog open/close | `ContactDialogs.astro` | XS |
| P3.2 | Visually-hidden "(opens in a new tab)" on external links | `NewsCard.astro`, `marketing.css` | S |
| P3.3 | Wire up or delete `data-field-error` | `FormField.astro` | S |

### Phase 4 — Close the verification gaps

These are not code changes; they are the testing this audit could not perform.

1. **Screen reader pass** — attempted and blocked on this machine; see §12. Automated VoiceOver
   capture does not work on macOS 26. Remaining routes, in order of practicality: **manual**
   VoiceOver + Safari testing by a human; **NVDA + Firefox on Windows** (Guidepup automates NVDA
   and is unaffected by the macOS regression); or automated VoiceOver on a macOS 15 or earlier
   machine. Priority flows: contact dialog open → fill → submit → success; donation page; news
   card grid; mobile menu. This specifically re-validates P1.5.
2. **Production-build scan** — `npm run build && npm run preview`, then re-run axe.
3. **Color-blindness simulation** — deuteranopia at minimum, focused on the accent-on-white
   affordances once Phase 1 lands.
4. **Bake it in** — the reveal-animation scanning trap (§2) will silently defeat any CI
   accessibility check. Whatever automated gate gets added must force `.is-revealed` first.

---

## 9. Appendix A — Automated scan results

axe-core 4.10.2, 1280×900, reveal animations forced visible. Counts **original → after Phase 1 →
after Phase 2 → after Phase 3**:

| Route | Original | After Phase 1 | After Phase 2 | After Phase 3 |
|---|---|---|---|---|
| `/` | 21 | 0 | **0** | **0** |
| `/what-we-do/` | 17 | 0 | **0** | **0** |
| `/programs-events/` | 10 | 0 | **0** | **0** |
| `/news/` | 57 | 1 (`heading-order`) | **0** | **0** |
| `/get-involved/` | 14 | 1 (`link-in-text-block`) | **0** | **0** |
| `/about/` | 35 | 0 | **0** | **0** |
| `/about/teams/` | 65 | 0 | **0** | **0** |
| `/donate/` | 9 | 1 (`frame-title`) | **0** | **0** |
| `/404` | 8 | 0 | **0** | **0** |
| **Total** | **236** | **3** | **0** | **0** |

**Phase 1** (2026-08-17) split the brand accent by job — `#2b7252` for anything read or seen,
`#40a578` retained for fills — clearing all 233 raw contrast violations. Details in §9's earlier
revision and commit `a137003`.

**Phase 2** (2026-08-17) cleared the remaining three and fixed four defects automated tooling
cannot see: the contact form's silent success state (P1.5), the hero heading clipped at 320px
(P1.8), the missing skip link (P2.3), and the nav's absent `aria-current` (P2.4). Two of those went
beyond the audit's stated scope on the user's instruction — sentence links are now underlined
sitewide, and the nav active state was repaired properly (it previously never fired on nested pages
like `/news/an-article/`, and the mobile drawer had no active state at all).

**Phase 3** (2026-08-17) closed the remaining polish items and the carousel pause control that had
been scoped for Phase 2 but not yet built:

- **P1.7** — the homepage carousel now has a sticky pause/play toggle beside prev/next. Unlike
  the existing hover/focus pause (which lifts the moment the pointer or focus leaves) and the
  interaction pause (which auto-resumes after 3s), the toggle holds until the visitor releases it
  — the mechanism 2.2.2 (Level A) actually asks for. It is removed entirely, not just hidden, when
  prefers-reduced-motion holds, since there is nothing running to pause.
- **P3.1** — the contact dialog now carries a static `aria-modal="true"`. Safe as a constant rather
  than something the open/close JS toggles: the element is `display:none` whenever `[open]` is
  absent, so the attribute is inert while closed and only takes effect once the dialog is shown.
- **P3.2** — every link that opens a new tab now says so programmatically, not just via the
  decorative `::after` arrow. One script in `MarketingLayout.astro`, run on load and on
  `astro:page-load`, covers both link shapes sitewide: for icon-only links (the footer's social
  row) the `aria-label` is extended ("Instagram" to "Instagram (opens in a new tab)"), since a
  present `aria-label` overrides any content and a hidden span there would be silently ignored;
  everything else gets a visually-hidden "(opens in a new tab)" span appended. Because
  `rehype-external-links.mjs` already sets `target="_blank"` on off-site Markdown links before this
  runs, the one pass covers hand-written `.astro` templates and MDX article bodies alike with no
  per-file edits and nothing for a content author to remember.
- **P3.3** — the unused `data-field-error` scaffolding in `FormField.astro` is removed rather than
  wired up, per the audit's own steer that a half-implemented custom-validation path invites the
  next person to assume it works. Every field's `aria-describedby` now points only at its hint id,
  or is omitted entirely when there is no hint, instead of always pointing at a permanently empty
  paragraph.

Behaviour that axe cannot assert was verified in Safari: the `close` event and form reset, focus
landing on the success panel, skip-link activation moving focus into `<main>`, and the injected
donation iframe receiving its title. Worth recording — **the in-app Chromium pane never fires
`close` events on `<dialog>`, even for a freshly created element**, which initially looked like a
regression in the reset logic and was not one.

**Zero violations** were found for: `image-alt`, `label`, `form-field-multiple-labels`,
`aria-*` (all rules), `button-name`, `link-name`, `html-has-lang`, `document-title`,
`landmark-*`, `list`, `listitem`, `duplicate-id`, `tabindex`, `region`.

**axe run inside the open contact dialog: 0 violations.**

## 10. Appendix B — Keyboard navigation notes

- Tab order on `/` is logical: logo → 6 nav links → Donate → hero CTAs → main content → footer.
- Focus indicator confirmed visible by real `Tab` traversal and screenshot: author-styled 2px
  `#40a578` ring at 3px offset on `.btn` / `.card-link` / `.form-input`; UA default ring elsewhere.
  **No `outline: none` or `outline-none` exists anywhere in `src/`** — verified by grep.
- Contact dialog: `Esc` closes; opening sets focus to the Close button; `inert` confirmed applied
  to `header`/`main`/`footer` on open and removed on close; focus is restored to the triggering
  element. This is correct hand-rolled modal behavior.
- `<details>` mobile menu: `summary` is keyboard-operable, and the 7 menu links are correctly
  non-focusable while collapsed (verified at 320px).
- Carousel: track is a `tabindex="0"` scroll region with `role="group"` and an `aria-label`; prev/next
  are real `<button>`s with `aria-label`s and correct `disabled` state at the ends.
- **Only keyboard defect found:** focus retained on a `display:none` element after form success (P1.5).

## 11. Appendix C — Screen reader notes

**No spoken output was captured.** A real attempt was made; it failed for environmental reasons,
not for lack of trying. Full detail in §12. This appendix records no announcement observations
because none were obtained — nothing here is estimated or inferred from a partial run.

## 12. Appendix D — VoiceOver automation attempt (macOS 26)

### What was built and run

A 12-step VoiceOver harness (Guidepup 0.33.2, Safari 26.5.2, macOS 26.5.2) covering the four
priority flows: homepage structure and nav state, the donation iframe, the contact dialog through
to its success state, and the news card grid.

Environment setup completed successfully:

- `npx @guidepup/setup setup` — VoiceOver AppleScript control enabled (`SCREnableAppleScript = 1`)
- `npx @guidepup/setup install` — downloaded `guidepup-voiceover-preferences-macos-26.dmg`
  (a macOS 26-specific build, so the tooling does target this OS)
- Full Disk Access granted to the host terminal, required for Guidepup to symlink its preference
  bundle into `~/Library/Group Containers/group.com.apple.VoiceOver/`
- Safari → Develop → Developer Settings → "Allow JavaScript from Apple Events" enabled

**VoiceOver started successfully and executed navigation commands.** Step counts came back
correct — 8 headings, 6 landmarks, 9 links — confirming VoiceOver was live and responding.

### Why it produced no data

Every captured phrase was an empty string. Direct testing against a running VoiceOver, bypassing
Guidepup entirely, isolated the cause to two AppleScript calls that macOS 26 no longer honors:

```
osascript: tell application "VoiceOver" to return content of last phrase
  -> execution error: Can't get content of last phrase. (-1728)

osascript: tell vo cursor to move right
  -> execution error: right doesn't understand the "move" message. (-1708)
     (also fails as: move down / move right / tell vo cursor of application "VoiceOver" to move right)
```

Both remain declared in VoiceOver's own scripting dictionary on this OS —
`sdef /System/Library/CoreServices/VoiceOver.app` still defines the `move` command with a
`direction` parameter accepting `right`, and a `last phrase object` class with a readable `content`
property. **The dictionary advertises them; the implementation no longer responds.** This is an
Apple-side regression in macOS 26, not a defect in Guidepup or in this site. Guidepup was silently
converting the `-1728` errors into empty strings, which is why the first run appeared to succeed.

**Conclusion: automated VoiceOver capture is not viable on macOS 26.** Manual testing, or testing
on macOS 15 or earlier, or NVDA on Windows, are the available routes.

### What this does and does not change

**Unaffected — these never depended on hearing anything:**

- **P1.6 (unnamed donation iframe)** stands as reported. Independently confirmed twice: axe's
  `frame-title` rule, and direct DOM inspection returning `title: null` and `aria-label: null`.
  A frame with no accessible name is an AA failure on markup alone.
- Every contrast finding (P1.1–P1.4), the reflow clipping (P1.8), the carousel autoplay (P1.7),
  heading order (P2.2), the missing skip link (P2.3), and the missing `aria-current` (P2.4) are
  all measured or structural. None require a screen reader.

**Partially affected:**

- **P1.5 (form success not announced)** — the markup facts are certain and re-verified: the
  success panel carries no `role`, no `aria-live`, and no `tabindex`; the only live region on the
  form is left empty on the success path; and focus remains on a `display: none` element after the
  swap. By specification a hidden element with no live region cannot produce an announcement, so
  the finding is sound. What remains unverified is the specific wording and timing each screen
  reader produces — which affects how the fix is validated, not whether the defect is real.

**A methodology note for whoever picks this up:** `read_page`-style DOM trees are not a substitute.
Verified during this audit — the contact dialog is `display: none` when closed, yet its full
contents still appear in that output. Those tools walk the DOM, not Chrome's computed
accessibility tree, and will report hidden content as though it were exposed.
