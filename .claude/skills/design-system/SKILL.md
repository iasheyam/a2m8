---
name: design-system
description: The a2m8 visual design system — tokens, typography, components and rules for any UI work in this repo. Load before writing or touching any page, component, or CSS in apps/web or packages/modules/*/src/ui.
---

# a2m8 design system

Drafting-document aesthetic. Commercial real estate, not consumer SaaS. Light paper
ground, near-black ink, one deep green accent (pine). Dense, legible, confident. No
gradients, no glassmorphism, no rounded-everything, no purple-blue AI palette.

The product is a working record, so it should read like a well-set document, not a
dashboard demo.

**No hand-written CSS, anywhere.** Every visual rule in this system is expressed as a
Tailwind utility class, a Tailwind `@theme` token, or a shared component in
`packages/ui` (`@a2m8/ui`). If a change seems to need a new CSS rule, it means either a
new `@theme` token or a new `@a2m8/ui` component — never a `.css` file, never
CSS-in-JS, never an inline `style=` prop for anything expressible as a token.

---

## Where things live

| What | File |
|---|---|
| Color/radius/shadow/font tokens | `apps/web/src/app/globals.css`, inside `@theme { ... }` |
| Tailwind content scan paths | Same file, the `@source` lines — **every new UI-bearing package needs one** |
| Fonts (loaded via `next/font/google`, not a `<link>` tag) | `apps/web/src/app/layout.tsx` |
| Shared components | `packages/ui/src/*` (`@a2m8/ui`) — `Button`, `Card`, `Input`, `Textarea`, `Chip`, `StatusPill`, `Switch`, `PageTitle`, `SectionHeading`, `Eyebrow`, `MetaText`, icons |
| App shell (sidebar, top bar) | `apps/web/src/app/app/layout.tsx` |

Before building a new page: import what you need from `@a2m8/ui` rather than
recreating a card/button/input inline. If the primitive you need doesn't exist yet,
add it to `packages/ui/src`, export it from `packages/ui/src/index.ts`, and use it —
don't hand-roll a one-off styled `<div>` that duplicates what a primitive should do.

---

## Tokens (`@theme` in `globals.css`)

```css
@theme {
  /* surfaces */
  --color-paper:   #EDEFEC;  /* app background */
  --color-card:    #FFFFFF;  /* panels, cards, tables */
  --color-sunken:  #F5F6F4;  /* disabled / inactive / hover rows */

  /* ink */
  --color-ink:     #111C20;  /* primary text, dark sidebar fill */
  --color-ink-2:   #3F4E54;  /* body text, secondary */
  --color-ink-3:   #75868C;  /* labels, meta, placeholders */

  /* accent — deep pine, the only brand colour */
  --color-pine:      #16554A;
  --color-pine-2:    #1E7263;  /* hover on pine */
  --color-pine-soft: #E4EDEA;  /* accent background fill, success chips */

  /* status */
  --color-amber:      #8A6210;
  --color-amber-soft: #FAF3E4;
  --color-red:        #9B2C2C;
  --color-red-soft:   #FAE9E9;

  /* lines */
  --color-line:   rgba(17,28,32,.15);
  --color-line-2: rgba(17,28,32,.08);

  /* radius — small and consistent, never pill except chips and switches */
  --radius-sm: 3px;
  --radius:    5px;
  --radius-lg: 7px;

  /* elevation — overlays only, never on a plain card */
  --shadow:    0 6px 20px rgba(17,28,32,.14);
  --shadow-lg: 0 14px 44px rgba(17,28,32,.22);

  /* type (see Fonts below for how these get their value) */
  --font-display: var(--font-display-family), Impact, sans-serif;
  --font-body:    var(--font-body-family), system-ui, sans-serif;
  --font-mono:    var(--font-mono-family), ui-monospace, monospace;
}
```

Use these as ordinary Tailwind utilities: `bg-paper`, `bg-card`, `text-ink-3`,
`border-line`, `bg-pine`, `rounded-sm`, `shadow-lg`, `font-display`, etc. Colors take
opacity modifiers normally (`border-red/30`).

**Accent discipline.** Pine is the only accent. Never introduce blue, purple, teal or a
second brand colour. Amber and red are status only, never decorative.

**Status semantics.** Pine = healthy, filed, connected, on time. Amber = needs
attention, due soon, missing, awaiting input. Red = overdue, failed, destructive
action. Never use colour alone to carry meaning — pair with a label (`StatusPill`
already does this).

---

## Fonts

Three families, loaded via `next/font/google` in `apps/web/src/app/layout.tsx` (not a
Google Fonts `<link>` tag — this is a Next.js app, so fonts are self-hosted and
optimized the idiomatic way). Each loader sets a CSS variable consumed by the
`@theme` block above:

```tsx
const display = Barlow_Condensed({ variable: "--font-display-family", weight: ["500","600","700"] });
const body    = IBM_Plex_Sans({ variable: "--font-body-family",    weight: ["400","500","600"] });
const mono    = IBM_Plex_Mono({ variable: "--font-mono-family",    weight: ["400","500","600"] });
```

`<html>` carries all three variable classNames; `<body>` carries `font-body` (plus
`bg-paper text-ink antialiased`) as the default. Use the `font-display` / `font-mono`
utilities to switch face per the scale below — never load a font any other way.

### Scale

| Role | Face | Size | Weight | Treatment |
|---|---|---|---|---|
| Page title | display | 30px | 600 | UPPERCASE, `leading-none` — use `PageTitle` |
| Section heading | display | 20px | 600 | UPPERCASE, `leading-none` — use `SectionHeading` |
| Card heading | display | 19px | 600 | UPPERCASE, `leading-none` — `Card`'s `title` prop does this |
| Body | body | 14px | 400 | line-height 1.45 |
| Body small | body | 12.5px | 400 | line-height 1.4 |
| Metric value | display | 42px | 700 | `leading-none` |
| Eyebrow / label | mono | 10.5px | 600 | UPPERCASE, `tracking-[.2em]` — use `Eyebrow` |
| Meta / timestamp | mono | 10px | 400 | `tracking-[.1em]` — use `MetaText` |
| Table header | mono | 10px | 500 | UPPERCASE, `tracking-wider` |

Rules:
- `font-display` (Barlow Condensed) is **always uppercase** and **never** used for body copy.
- `font-mono` (IBM Plex Mono) is for labels, timestamps, ids, counts, money, dates —
  never paragraphs. Dates and money are always mono so table columns align.
- Sentence case for body copy. No title case.

---

## Layout

- Sidebar: fixed, `w-[236px]` expanded / `w-14` collapsed, `bg-ink`. See
  `apps/web/src/app/app/layout.tsx`.
- Top bar: `h-[60px]`, `bg-card`, `border-b border-line`.
- Content area scrolls independently (`overflow-y-auto`), `p-6` (24px).
- Reading views should self-constrain to `max-w-3xl` or similar; tables may run full
  width inside their own `overflow-x-auto` container. There is no global max-width
  wrapper in the shell — each page decides.
- Base spacing unit 4px. Prefer Tailwind's default scale (`px-3`, `py-2`, `gap-3.5`,
  `p-6`); drop to an arbitrary value (`p-[18px]`) only when the spec calls for a
  number the default scale doesn't have.

---

## Components (`@a2m8/ui`)

### `Card`
`bg-card border border-line rounded`. Optional `title` renders a header row
(`border-b border-line-2`, `font-display` uppercase) with an optional `action` node
on the right. Body padding `p-[18px]` by default (override via `bodyClassName`, e.g.
`bodyClassName="p-0"` for a card that's just a table). No shadow — shadow is for
overlays only.

### `Button`
`variant`: `"default"` (card fill, line border, hover darkens border), `"primary"`
(pine fill, white text, hover `pine-2`), `"destructive"` (transparent, red text/border,
hover `red-soft` fill). `size`: `"default"` or `"sm"`. No pill buttons, no gradient
fills, no uppercase labels.

### `Chip`
Pill radius (**allowed here, and on `Switch` — the only two exceptions to the
small-radius rule**). Mono, 10.5px, uppercase. Optional `onRemove` renders an inline
`XIcon`. Optional `onClick`/`active` for filter-chip usage (active = ink fill, white
text).

### `StatusPill`
`status`: `"pine" | "amber" | "red"`. Mono, 10px, uppercase, the matching `-soft`
background with its ink color. If a status doesn't fit pine/amber/red (e.g. a neutral
"no answer" outcome), don't force it into the enum — render a plain `bg-sunken
text-ink-2` badge inline instead, as `leads-page`'s `OutcomeBadge` does.

### `Input` / `Textarea`
`bg-card border border-line rounded-sm`, 13px body font. Focus: border becomes
`pine`. No glow, no ring, no shadow on focus.

### `Switch`
Binary toggle, pill track (`bg-line` off / `bg-pine` on) with a sliding `bg-card`
thumb. Used for feature activation and similar on/off settings.

### Tables
Row separators `border-line-2` (not a border on every cell), no separator on the last
row. First column bold `text-ink`, remaining columns `text-ink-2`. Header row
`bg-sunken`, mono uppercase `text-ink-3`. Wrap in `Card bodyClassName="p-0"` with
`className="overflow-x-auto"` (or `overflow-hidden` if it never needs to scroll).

### Icons
`packages/ui/src/icons.tsx` — stroke-only SVG, 24×24 viewBox, `stroke-width: 1.75`,
round caps/joins, `fill: none`, `stroke: currentColor`, Lucide-style geometry. Render
at `w-4 h-4` (16px) in dense UI, `w-5 h-5`+ in feature contexts. **Never emoji, never a
raw unicode glyph (✕ ▾ ▸ ‹ ›) for an interface icon** — every one of those got replaced
with an `@a2m8/ui` icon component during the redesign; don't reintroduce them.

---

## Motion

Restrained, 150–250ms, `transition-colors` / `transition-all` with Tailwind's default
easing. View transitions: a small rise plus fade, not a slide-and-bounce. Never animate
more than one thing at once on screen. Respect `prefers-reduced-motion` (Tailwind's
`motion-reduce:` variant) for anything non-trivial.

---

## Accessibility

- Body text on `paper`/`card` must hold 4.5:1 contrast. `ink-3` is for labels/meta
  only, never running copy.
- Focus visible on every interactive element — `Button`, `Input`, `Switch` all carry a
  visible focus state; don't strip it with a bare `outline-none` unless you're also
  supplying a replacement ring.
- Hit targets 40px minimum on touch-oriented controls.
- Status is never color-only — `StatusPill` always renders a text label alongside the
  color.

---

## Do not

- Rounded-2xl cards, soft drop shadows on everything, a floating-card layout
- Purple/indigo/electric-blue — this was the *previous* theme; if you see
  `indigo-`/`slate-` classes anywhere, they're leftover and should be converted
- Gradient text or gradient buttons
- Emoji or raw unicode glyphs as interface icons
- Centred hero sections in an application view
- More than one accent colour
- `font-display` in sentence case or in body copy
- A new `.css` file, a `<style>` block, or inline `style={{ ... }}` for anything a
  Tailwind utility or `@theme` token can express
