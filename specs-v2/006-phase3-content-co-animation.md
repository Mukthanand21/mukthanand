# Phase 3 — Content Co-Animation

> **Status:** ⏳ Planned — not yet implemented
> **Branch:** `feat/scroll-single-page`
> **Estimated effort:** ~5 hours (7 steps)
>
> Read `specs-v2/TRACKING.md` for full session context.
> Read `specs-v2/000-overview.md` for the design system.
> Read `AGENTS.md` for the project rules.

---

## 1. The Problem

Currently, **two independent animation systems** run on the same scroll, disconnected from each other:

| System | Driver | What it controls | Trigger |
|---|---|---|---|
| **Rack director** | `useRackScrollDirector` → `rackDirector.lerpStates()` | Three.js camera, rack opacity, group transform | `onUpdate(self.progress)` — 0→1 per chapter boundary |
| **Content entrances** | `useSectionTransition` + `<Reveal>` wrappers | Section labels, titles, card reveals, metrics | Separate `ScrollTrigger` at `top 82%` |

**Result:** The rack camera can be 50% through a recede while service cards pop into view at a completely unrelated scroll position. There is no visual connection between the two.

---

## 2. The Solution: Shared Progress Bus

The rack director already owns a set of `ScrollTrigger` instances — one per chapter boundary — each providing a 0→1 `progress` value as the user scrolls between sections. **Phase 3 taps the same progress to drive content animations.**

```
useRackScrollDirector (owns ScrollTrigger, one per chapter boundary)
  │
  ├─→ rackDirector.lerpStates(from.rack, to.rack, progress)      [existing]
  │
  └─→ contentDirector.tick(fromId, toId, progress, from, to)      [NEW]
        │
        ├─→ section title / label / accent line  (progress >= 0.05)
        ├─→ card stagger (progress 0.1 → 0.7 → opacity+y per card)
        └─→ highlighted LED indices (→ rack render loop spikes emissiveIntensity)
```

**Key change:** No more independent `useSectionTransition` ScrollTriggers. No more `<Reveal>` wrappers in co-animated sections. **One source of truth** for scroll-driven animation — the chapter boundary ScrollTrigger.

---

## 3. Architecture

### 3.1 New Type: `ContentPhase`

Add to `src/motion/rackChapters.ts`:

```typescript
export type ContentPhase = {
  /** Progress range for card stagger: [start, end].
   *  Cards enter between start*progress and end*progress of the chapter transition.
   *  Default: [0.1, 0.7] */
  cardStaggerWindow: [number, number];

  /** Maps card index → rack unit LED index.
   *  When card[i] enters, LED at `unitHighlightMap[i]` spikes emissiveIntensity.
   *  Each entry's rack LED is highlighted as that card staggers in. */
  unitHighlightMap: Record<number, number>;

  /** Progress at which section label, title, and gold accent line begin reveal.
   *  Default: 0.05 (5% into the chapter transition) */
  sectionTitleAtProgress: number;

  /** Changelog-specific: entries that trigger brief LED flashes.
   *  Each entry specifies the progress point and which rack unit LED to flash. */
  ledPulseAt?: { progress: number; unitIndex: number }[];
};
```

Add `content?: ContentPhase` to `ChapterMeta`:

```typescript
export type ChapterMeta = {
  id: SectionId;
  title: string;
  rack: RackChapterState;
  scrim: string | null;
  content?: ContentPhase;              // NEW
};
```

### 3.2 New Module: `contentDirector`

File: `src/motion/contentDirector.ts`

A module-level state object (parallel to `rackDirector.ts`) that tracks content animation state and notifies subscribers on change.

```typescript
export type ContentState = {
  /** The section ID currently dominant in the content animation */
  chapterId: SectionId | null;
  /** 0→1 progress of the current chapter transition */
  chapterProgress: number;
  /** 0→1 progress specifically for card stagger (remapped from chapterProgress) */
  cardProgress: number;
  /** Array of rack unit LED indices that should be highlighted right now */
  highlightedUnitIndices: number[];
  /** 0→1 progress for section title / label / accent line reveal */
  titleProgress: number;
};

const current: ContentState = { ... };

export const contentDirector = {
  get current() { return current; },

  /** Called from useRackScrollDirector onUpdate(self.progress)
   *  Computes cardProgress, titleProgress, highlightedUnitIndices
   *  from the current progress and the fromChapter / toChapter content configs. */
  tick(fromId: SectionId, toId: SectionId, progress: number,
       fromChapter: ChapterMeta, toChapter: ChapterMeta): void,

  subscribe(fn: () => void): () => void,
};
```

The `tick()` method logic:

```typescript
function tick(fromId, toId, progress, fromChapter, toChapter) {
  const content = toChapter.content;
  if (!content) { /* fade out */ return; }

  // Title reveal: progress 0→1 over a small range starting at sectionTitleAtProgress
  const titleProgress = clamp((progress - content.sectionTitleAtProgress) / 0.15, 0, 1);

  // Card stagger: remap progress from [cardStaggerWindow[0], cardStaggerWindow[1]] → [0, 1]
  const [winStart, winEnd] = content.cardStaggerWindow;
  const cardProgress = clamp((progress - winStart) / (winEnd - winStart), 0, 1);

  // LED highlights: for cards that have entered, compute which are visible
  // card i is visible if cardProgress > i / cardCount
  // then map to unitHighlightMap
  const highlightedUnitIndices = computeHighlights(cardProgress, content.unitHighlightMap);

  current = { chapterId: toId, chapterProgress: progress, cardProgress, highlightedUnitIndices, titleProgress };
  notify();
}
```

### 3.3 Modified: `useRackScrollDirector`

Add one call inside the existing `onUpdate(self)` handler:

```typescript
onUpdate(self) {
  rackDirector.lerpStates(fromChapter.rack, toChapter.rack, self.progress);
  contentDirector.tick(fromId, toId, self.progress, fromChapter, toChapter);  // ← ADD
}
```

The scroll director already has `fromChapter` and `toChapter` available from the `chapterMap`. No new ScrollTrigger instances needed.

### 3.4 New Hook: `useContentAnimations`

File: `src/motion/useContentAnimations.ts`

A React hook that subscribes to `contentDirector` and applies GSAP animations to DOM elements based on the current state.

```typescript
export function useContentAnimations(options?: {
  sectionIds?: SectionId[];
  bootComplete?: boolean;
}): void {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Subscribe to contentDirector changes
    const unsub = contentDirector.subscribe(() => {
      const state = contentDirector.current;
      const sectionEl = state.chapterId ? document.getElementById(state.chapterId) : null;
      if (!sectionEl) return;

      // 1. Title reveal: animate [data-section-label], [data-section-title], [data-section-accent-line]
      if (state.titleProgress > 0 && !reduced) {
        gsap.to(sectionEl.querySelector('[data-section-label]'), {
          opacity: state.titleProgress,
          letterSpacing: `${0.15 - state.titleProgress * 0.05}em`,
          duration: 0.05, overwrite: 'auto',
        });
        gsap.to(sectionEl.querySelector('[data-section-title]'), {
          opacity: state.titleProgress,
          y: 8 * (1 - state.titleProgress),
          duration: 0.05, overwrite: 'auto',
        });
        gsap.to(sectionEl.querySelector('[data-section-accent-line]'), {
          width: `${state.titleProgress * 100}%`,
          opacity: state.titleProgress,
          duration: 0.05, overwrite: 'auto',
        });
      }

      // 2. Card stagger: iterate cards, compute each one's threshold
      const cards = sectionEl.querySelectorAll('[data-section-card]');
      cards.forEach((card, i) => {
        const threshold = i / cards.length; // card i enters at cardProgress > i/count
        const visible = state.cardProgress > threshold;
        if (visible && card.getAttribute('data-section-card-visible') !== 'true') {
          gsap.to(card, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          card.setAttribute('data-section-card-visible', 'true');
        }
      });
    });

    return unsub;
  }, [reduced]);
}
```

The hook is called in `IndexPage.tsx` and runs alongside `useRackScrollDirector`.

### 3.5 Modified: `useRackScene` — LED Pulse Integration

In the Three.js render tick, read `contentDirector.current.highlightedUnitIndices`. For each rack LED:

```typescript
// In the tick loop, after existing LED animation
const highlighted = contentDirector.current.highlightedUnitIndices;

leds.forEach((led, idx) => {
  if (!highlighted.includes(idx)) return; // normal animation continues

  // Override emissive intensity with a fast pulse
  const pulse = Math.sin(elapsed * 8 + idx) * 0.5 + 0.5; // 0→1, ~0.125s period
  led.material.emissiveIntensity = 0.8 + pulse * 2.5;    // spike from 0.8 to 3.3
});
```

This creates a visible "unit highlighting" effect — when a service card enters, the corresponding rack unit's LEDs brighten and pulse.

### 3.6 Modified: `IndexPage.tsx`

Replace:
```typescript
useInitTransitions();                        // REMOVED — no more independent gold-sweep overlays
useRackScrollDirector({ bootComplete, ... }); // KEPT
useContentAnimations({ bootComplete });       // ADDED
```

### 3.7 Modified: `Section.tsx`

Remove the `useSectionTransition` call — section entrances are now driven by `useContentAnimations` via the shared progress bus.

Remove:
```typescript
const sectionRef = useSectionTransition(id) as RefObject<HTMLElement>;
// ...
ref={sectionRef}
```

Keep the full-bleed layout, grain overlay, chapter scrim, gold hairline, and all data attributes (`data-section-label`, `data-section-title`, `data-section-accent-line`). The gold hairline transitions from static to animated (width driven by content director titleProgress).

---

## 4. Content Phase Configurations

### 4.1 Status → Services (Rack Transition)

```typescript
{
  id: 'services',
  content: {
    cardStaggerWindow: [0.1, 0.7],       // cards enter over 60% of transition
    unitHighlightMap: {
      0: 4,   // Ask Your Corpus → /retrieve unit LED #4
      1: 7,   // Scheme Saathi → /chat unit LED #7
      2: 16,  // FAQ Sense → side rack LED #0
      3: -1,  // MediFlow AI (archived) — no highlight
    },
    sectionTitleAtProgress: 0.05,         // "/services" label begins at 5%
  }
}
```

**Card 0 (POST /retrieve — Ask Your Corpus)** enters when `cardProgress > 0/4 = 0` — immediately as card stagger begins at progress 0.1. Unit 1 LED highlights.

**Card 1 (POST /chat — Scheme Saathi)** enters at `cardProgress > 1/4 = 0.25` — at progress `0.1 + 0.25 * 0.6 = 0.25`. Unit 2 LED highlights.

**Card 2 (GET /faq — FAQ Sense)** enters at `cardProgress > 2/4 = 0.5` — at progress `0.1 + 0.5 * 0.6 = 0.4`. Side rack LED highlights.

**Card 3 (archived)** enters at `cardProgress > 3/4 = 0.75` — at progress `0.1 + 0.75 * 0.6 = 0.55`. No highlight.

### 4.2 Services → Changelog

```typescript
{
  id: 'changelog',
  content: {
    cardStaggerWindow: [0.15, 0.8],
    unitHighlightMap: {
      0: 4, 1: 7, 2: 10, 3: 16, 4: 13, 5: 0,
    },
    sectionTitleAtProgress: 0.05,
    ledPulseAt: [
      { progress: 0.15, unitIndex: -1 },  // -1 = all units flash (major: v2.0.0)
      { progress: 0.30, unitIndex: 4 },   // unit 1 (/retrieve) — v1.4.0
      { progress: 0.45, unitIndex: 7 },   // unit 2 (/chat) — v1.3.0
      { progress: 0.60, unitIndex: 16 },  // side rack — v1.2.0 EHRS
      { progress: 0.75, unitIndex: 13 },  // unit 3 (/agentic) — v1.1.0
      { progress: 0.90, unitIndex: -1 },  // all units flash (major: v1.0.0)
    ],
  }
}
```

Each changelog entry, as scroll progress passes the entry's `ledPulseAt.progress`, briefly flashes the corresponding rack unit LED. Major releases (v2.0.0, v1.0.0) flash ALL units.

### 4.3 Changelog → Stack

```typescript
{
  id: 'stack',
  content: {
    cardStaggerWindow: [0.2, 0.75],
    unitHighlightMap: {},                // no highlights for stack cards
    sectionTitleAtProgress: 0.05,
  }
}
```

Stack section uses a simple stagger — no rack unit highlights since the stack shows skills, not services.

### 4.4 Stack → Contact

```typescript
{
  id: 'contact',
  content: {
    cardStaggerWindow: [0.2, 0.6],
    unitHighlightMap: {},
    sectionTitleAtProgress: 0.05,
  }
}
```

---

## 5. Conflict with `<Reveal>` and `useSectionTransition`

### Decision: Remove `<Reveal>` from co-animated sections

**Sections affected:**
- `src/sections/Services.tsx` — remove `<Reveal>` wrappers around `ServiceCard`
- `src/sections/Changelog.tsx` — remove `<Reveal>` wrappers around timeline entries

**Sections NOT affected:**
- `Status.tsx` — no `<Reveal>` (has its own boot animation)
- `Stack.tsx` — uses Framer Motion tabs, no `<Reveal>` used for skill cards
- `Contact.tsx` — can keep `<Reveal>` for the form column (it's a single element, not a stagger)

**Why remove:** Content director's GSAP timelines target the same `[data-section-card]` elements. With both active, `<Reveal>` would fire its own ScrollTrigger at a different scroll position, then the content director would override it. The result would be flickering cards. Removing `<Reveal>` ensures one source of truth.

### Also remove: `useSectionTransition` from `Section.tsx`

The `useSectionTransition` hook currently creates its own ScrollTrigger per section. Phase 3 replaces this — the content director drives label, title, accent-line, and card animations via the same progress as the rack.

---

## 6. Implementation Order (7 Steps)

| Step | Files | Description | Est. |
|---|---|---|---|
| **1** | `rackChapters.ts` | Add `ContentPhase` type + `content` field to `ChapterMeta`. Populate content configs for all 5 chapters (services→changelog gets `ledPulseAt`). | 30 min |
| **2** | `contentDirector.ts` (new) | Module-level `ContentState`, `tick()` method, `subscribe(fn)` / `notify()`. | 45 min |
| **3** | `useRackScrollDirector.ts` | Add `contentDirector.tick()` call in `onUpdate(self)`. | 15 min |
| **4** | `useContentAnimations.ts` (new) | React hook subscribing to `contentDirector` — drives GSAP on `[data-section-label]`, `[data-section-title]`, `[data-section-accent-line]`, `[data-section-card]`. | 1.5 hr |
| **5** | `useRackScene.ts` | In render tick, read `contentDirector.current.highlightedUnitIndices` and spike emissiveIntensity on matched LEDs. | 1 hr |
| **6** | `Section.tsx` + `IndexPage.tsx` + `Services.tsx` + `Changelog.tsx` | Remove `useSectionTransition`, remove `<Reveal>` wrappers, swap in `useContentAnimations`. | 30 min |
| **7** | Validate | `npx tsc --noEmit`, `npm run build`, browser test all 5 scroll transitions. | 30 min |

**Total: ~5 hours**

---

## 7. Edge Cases & Risks

| Risk | Mitigation |
|---|---|
| **LED emissiveIntensity conflict** with existing blink/sine wave animation | The highlight spike overrides only for the active `ledPulseAt` duration (~200ms per pulse). After that, normal blink resumes. The spike is additive: `normalIntensity + pulse`. |
| **Card stagger + remaining `<Reveal>` double-animate** in sections not refactored | `useContentAnimations` sets `data-section-card-visible` attribute. Skip cards that already have this attribute set. |
| **Progress values don't align with card count exactly** | Card i enters at `cardProgress > i / cardCount`. This gives equal spacing regardless of total cards. |
| **Section without `content` config** (e.g., if `content` is undefined) | `tick()` returns early, no content animations for that chapter. Existing static rendering continues. |
| **Reduced motion** | `useContentAnimations` checks `usePrefersReducedMotion()` — sets all content to `opacity: 1, y: 0, width: 100%` immediately without GSAP. |
| **Mobile** | Content director still runs (cards still need to appear), but GSAP duration is shortened to 0.1s and stagger is disabled (all cards appear at once when `cardProgress > 0`). |

---

## 8. How to Continue

```bash
git checkout feat/scroll-single-page

# Step 1: rackChapters.ts
# Step 2: create contentDirector.ts
# etc.
```

### Key Files

| File | Role |
|---|---|
| `src/motion/rackChapters.ts` | Add `ContentPhase`, populate per chapter |
| `src/motion/contentDirector.ts` | NEW — shared state bus |
| `src/motion/useContentAnimations.ts` | NEW — React hook consuming contentDirector |
| `src/motion/useRackScrollDirector.ts` | Add one `contentDirector.tick()` call |
| `src/hooks/useRackScene.ts` | LED pulse integration in render tick |
| `src/components/Section.tsx` | Remove `useSectionTransition` |
| `src/pages/IndexPage.tsx` | Wire `useContentAnimations` |
| `src/sections/Services.tsx` | Remove `<Reveal>` wrappers |
| `src/sections/Changelog.tsx` | Remove `<Reveal>` wrappers |

### Git

All work goes on `feat/scroll-single-page`. Commit after each step or at logical checkpoints.
