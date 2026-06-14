# specs-v2/animations/bootloader-v3.md
> **STATUS: LOCKED**
> Full animation spec for `src/components/BootLoader.tsx` v3.
> The reference implementation is the approved HTML demo (bootloader_indian_language_name_reveal.html).
> Implement exactly as described. Do not deviate.

> **Color adaptation note:** The reference demo was built on `#2E1F2E` (deep plum). This adaptation uses the project's existing `--color-bg: #0A0A0A` (near-black). All intermediate animation colors have been verified to work on `#0A0A0A` — they are all significantly lighter than the background and the dim→brightening arc reads correctly.

---

## Overview

A cinematic multilingual bootloader.
Each letter of `MUKTHANAND` cycles through its equivalents in 5 Indian scripts (Telugu, Hindi, Tamil, Kannada, Bengali), then locks to English — one letter at a time, left to right.
Each letter waits for the previous to fully lock before starting.
No REDDY. No particle burst. The sequence ends at SYSTEM READY.

---

## Script Data (LOCKED)

```typescript
const LETTER_SCRIPTS: Record<string, string[]> = {
  'M': ['మ', 'म', 'ம', 'ಮ', 'ম'],
  'U': ['ఉ', 'उ', 'உ', 'ಉ', 'উ'],
  'K': ['క', 'क', 'க', 'ಕ', 'ক'],
  'T': ['త', 'त', 'த', 'ತ', 'ত'],
  'H': ['హ', 'ह', 'ஹ', 'ಹ', 'হ'],
  'A': ['అ', 'अ', 'அ', 'ಅ', 'অ'],
  'N': ['న', 'न', 'ந', 'ನ', 'ন'],
  'D': ['డ', 'ड', 'ட', 'ಡ', 'ড'],
};

const SCRIPT_NAMES = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Bengali'];

const SCRIPT_FONTS = [
  "'Noto Sans Telugu', sans-serif",
  "'Noto Sans Devanagari', sans-serif",
  "'Noto Sans Tamil', sans-serif",
  "'Noto Sans Kannada', sans-serif",
  "'Noto Sans Bengali', sans-serif",
];

const NAME = 'MUKTHANAND';
```

---

## Font Setup (index.html)

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Telugu:wght@700&family=Noto+Sans+Devanagari:wght@700&family=Noto+Sans+Tamil:wght@700&family=Noto+Sans+Kannada:wght@700&family=Noto+Sans+Bengali:wght@700&display=swap" rel="stylesheet"/>
```

---

## Layout Structure

```
[script-label]          ← current language name, mono 10px, --color-text-muted
[M][U][K][T][H][A][N][A][N][D]   ← letter row, clamp(36px,6vw,68px), Syne 800
                        ← NO REDDY element
[gold-line]             ← gradient underline, height 2px
[status]                ← mono 11px, letter-spacing 0.15em, uppercase
[progress bar]          ← 180px wide, 1px tall, track #2A1F2A, fill --color-accent
[pct]                   ← mono 10px
```

---

## Stage Sequence

### Stage 1 — Black flash (0ms – 80ms)
- Background: `#000000`. Nothing visible.

### Stage 2 — System boot (80ms)
- `background` transitions `#000 → var(--color-bg)` over `1000ms ease-out`
  (Note: `#000` and `#0A0A0A` are visually near-identical, so this transition is imperceptible — included for spec completeness)
- Ambient particles begin (see §Ambient Particles)
- Status: `INITIALIZING...` — color `var(--color-text-muted)`
- Progress: `8%`

### Stage 3 — Asset loading (680ms)
- Status: `LOADING ASSETS...`
- Progress: `20%`

### Stage 4 — Identity resolution (1080ms)
- Status: `RESOLVING IDENTITY...` — color `var(--color-text-secondary)` (`#B79CAE`)
- Progress: `35%`
- Letter cycling begins (see §cycleLetter)

### Stage 5 — Letter cycling (sequential, 1080ms onward)
- Letters cycle and lock one at a time, left to right
- Each letter waits for previous to fully lock before starting
- 60ms gap between one letter locking and next letter starting
- Progress increments: `35% + floor((letterIdx / 10) * 45)%` per letter start

### Stage 6 — All locked (after last letter locks)
- `script-label` fades out
- Progress: `85%`
- After 300ms: gold line sweeps in — `width: 0 → 320px`, `transition: width 1s cubic-bezier(0.16,1,0.3,1)`
- Progress: `100%`
- After 300ms: status fades out, then types in `SYSTEM READY` (see §typeIn)
  - Color: `var(--color-accent)`
  - Speed: `55ms` per character with `█` cursor
- **Sequence ends. No particle burst. No REDDY.**
- Call `onComplete()` after typeIn finishes.

---

## cycleLetter Function

```
Input: span element, letter (e.g. 'M'), onLock callback

scripts = LETTER_SCRIPTS[letter]  // 5 script chars
cycle runs scripts.length * 2 = 10 total iterations

Iteration 0–4 (first pass through scripts):
  span.textContent = scripts[si % 5]
  span.fontFamily  = SCRIPT_FONTS[si % 5]
  span.color       = '#4D3A4D'  (dim)
  label.textContent = SCRIPT_NAMES[si % 5]
  label.opacity    = 1
  interval: 80ms

Iteration 5–9 (second pass, brighter):
  span.color       = '#8A6A8A'  (brighter)
  interval: 55ms  (speeds up — building energy)

On iteration 10 (LOCK to English):
  span.fontFamily  = "'Syne', sans-serif"
  span.textContent = letter (English)
  span.color       = '#E8B65A'  (gold flash)
  span.transform   = 'scale(1.15)'
  After 200ms:
    span.color     = '#F3EAEF'  (settle to white)
    span.transform = 'scale(1)'
    → call onLock()
```

---

## Letter Span Styles

```css
font-size: clamp(36px, 6vw, 68px);
font-weight: 800;
display: inline-block;
min-width: 0.6em;
text-align: center;
transition: color 0.3s, font-family 0.15s, transform 0.3s;
color: #3D2A3D;  /* initial dim — nearly invisible */
font-family: 'Syne', sans-serif;
gap between spans: 2px
```

Initial state: all letters display their English character, color `#3D2A3D` (nearly invisible on near-black bg).
They are not hidden — they exist in the row from the start, just extremely dim.

---

## Script Label Styles

```css
font-family: 'JetBrains Mono', monospace;
font-size: 10px;
color: var(--color-text-muted);
letter-spacing: 0.2em;
text-transform: uppercase;
height: 14px;
transition: opacity 0.2s;
```

Updates on every script change during cycling. Fades out after all letters lock.

---

## typeIn Function

```
Types text into element one character at a time.
Appends '█' cursor while typing, removes on completion.
Speed: 55ms per character.
Calls done() callback when complete.
```

---

## Ambient Particles

```
canvas: position absolute, inset 0, full width/height, pointer-events none
count: 14
per particle:
  x, y: random within canvas
  r: 0.5–1.5px
  opacity: 0.05–0.2
  vx, vy: random ±0.2 (slow drift)
  color: var(--color-accent)
wrap at canvas edges (modulo canvas.width/height)
technique: requestAnimationFrame loop, ctx.clearRect each frame
wrap in try/catch — skip silently if canvas unavailable
```

---

## Progress Bar Styles

```css
width: 180px;
height: 1px;
background (track): #2A1F2A;
fill: var(--color-accent);
transition: width 0.4s ease-out;
position: relative; overflow: hidden;
```

---

## Color Reference

All colors used in the bootloader, mapped to their purpose:

| Value | Token / Role | Usage |
|---|---|---|
| `#000000` | — (momentary) | Stage 1 cold start flash (80ms) |
| `var(--color-bg)` = `#0A0A0A` | Design token | Background from Stage 2 onward |
| `#2A1F2A` | — | Progress bar track |
| `#3D2A3D` | — | Initial letter color (dim, pre-cycle) |
| `#4D3A4D` | — | Cycle chars, first pass (dim) |
| `#8A6A8A` | — | Cycle chars, second pass (brighter) |
| `var(--color-accent)` = `#E8B65A` | Design token | Gold flash on lock, SYSTEM text, progress fill, gold line |
| `var(--color-text-primary)` = `#F3EAEF` | Design token | Settled English letter color |
| `var(--color-text-muted)` = `#6B4D6B` | Design token | Script label, status lines (INITIALIZING, LOADING) |
| `var(--color-text-secondary)` = `#B79CAE` | Design token | RESOLVING IDENTITY status |

> **Note:** The intermediate animation colors (`#3D2A3D`, `#4D3A4D`, `#8A6A8A`, `#2A1F2A`) are **local to the BootLoader component** — they are animation state colors used to build tension before the gold reveal. They are not design system tokens and should not be referenced outside of `BootLoader.tsx`.

---

## Reduced Motion

```typescript
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  // Skip all stages
  // Show MUKTHANAND in English immediately, color var(--color-text-primary)
  // Show gold line at full width
  // Status: 'SYSTEM READY' instantly (no typewriter)
  // 200ms opacity fade, call onComplete()
}
```

---

## Replay / Session Behavior

- Runs on every page load and hard reload
- No sessionStorage
- No skip logic
- No replay button
- SPA internal navigation does NOT retrigger

---

## Cleanup

On component unmount:
```typescript
timers.forEach(clearTimeout);
rafs.forEach(cancelAnimationFrame);
```

Store all setTimeout IDs in a `timers` array.
Store all requestAnimationFrame IDs in a `rafs` array.
Cancel all on unmount.

---

## What NOT to Do

- NO REDDY element anywhere
- NO particle burst at the end
- NO sessionStorage or replay button
- NO Framer Motion — vanilla rAF + CSS transitions only
- NO hardcoded hex — use CSS custom properties except where noted
- NO changes to LETTER_SCRIPTS data
- NO changes to the cycling logic (10 iterations, 80ms first pass, 55ms second pass)
- NO parallel letter cycling — strictly sequential, one locks then next starts
