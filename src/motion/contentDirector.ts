import {
  type SectionId,
  type ChapterMeta,
  type ContentPhase,
} from './rackChapters';

/* ═══════════════════════════════════════════════════════
   contentDirector — module-level scroll state for content animations

   Written by useRackScrollDirector via tick().
   Read each frame by useContentAnimations (React hook)
   and by useRackScene tick loop (for LED highlights).

   Parallel structure to rackDirector.ts but for DOM content
   animation state (card stagger, title reveal, LED highlight
   indices).
   ═══════════════════════════════════════════════════════ */

export type ContentState = {
  /** The section ID currently entering (the "to" chapter) */
  chapterId: SectionId | null;
  /** Raw 0→1 progress of the current chapter transition */
  chapterProgress: number;
  /** 0→1 progress remapped through cardStaggerWindow.
   *  0 = first card begins entering. 1 = last card finished. */
  cardProgress: number;
  /** Array of rack unit LED indices that should be highlighted
   *  (emissiveIntensity spike) right now. Empty = no highlights. */
  highlightedUnitIndices: number[];
  /** 0→1 progress for section title / label / accent line reveal.
   *  0 = hidden. 1 = fully revealed. */
  titleProgress: number;
  /** Set of LED indices currently in a pulse state from
   *  ledPulseAt config. Reset each chapter transition. */
  ledPulseActive: Set<number>;
};

/* ─── Default state (before any scroll interaction) ─── */
const DEFAULT_STATE: ContentState = {
  chapterId: null,
  chapterProgress: 0,
  cardProgress: 0,
  highlightedUnitIndices: [],
  titleProgress: 0,
  ledPulseActive: new Set(),
};

let current: ContentState = { ...DEFAULT_STATE, ledPulseActive: new Set() };
let previousFromId: SectionId | null = null;
let previousToId: SectionId | null = null;

/** Track which ledPulseAt entries have been triggered this transition.
 *  Reset when (fromId, toId) changes. */
let triggeredPulses = new Set<number>();

/* ─── Subscribers ─── */
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/* ─── Helpers ─── */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Compute highlighted unit indices from cardProgress and unitHighlightMap.
 *  Card i is highlighted when cardProgress > i / totalCards.
 *  -1 in the map means no highlight for that card. */
function computeHighlights(
  cardProgress: number,
  unitHighlightMap: Record<number, number>,
): number[] {
  const totalCards = Object.keys(unitHighlightMap).length;
  if (totalCards === 0) return [];

  const indices: number[] = [];
  for (let i = 0; i < totalCards; i++) {
    const threshold = totalCards > 1 ? i / totalCards : 0;
    if (cardProgress > threshold) {
      const ledIdx = unitHighlightMap[i];
      if (ledIdx >= 0) indices.push(ledIdx);
    }
  }
  return indices;
}

/** Compute which LEDs should pulse based on ledPulseAt config and
 *  the current chapterProgress. Returns the set of LED indices to pulse. */
function computeLedPulses(
  progress: number,
  ledPulseAt: NonNullable<ContentPhase['ledPulseAt']>,
): Set<number> {
  const pulses = new Set<number>();
  for (let i = 0; i < ledPulseAt.length; i++) {
    const { progress: p, unitIndex } = ledPulseAt[i];
    // Trigger pulse when progress crosses the configured point (within 2% window)
    if (progress >= p && progress < p + 0.02 && !triggeredPulses.has(i)) {
      triggeredPulses.add(i);
      if (unitIndex === -1) {
        // -1 = all units (major release flash)
        // Return a sentinel that the consumer interprets as "flash all"
        // We use a special value: -2 means "all"
        pulses.add(-2);
      } else {
        pulses.add(unitIndex);
      }
    }
  }
  return pulses;
}

/* ═══════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════ */
export const contentDirector = {
  get current(): ContentState {
    return current;
  },

  /** Called from useRackScrollDirector onUpdate(self.progress).
   *  Computes cardProgress, titleProgress, highlightedUnitIndices
   *  from the current progress and the chapter content configs.
   *
   *  @param fromId — The departing section ID
   *  @param toId — The arriving section ID
   *  @param progress — Raw scroll progress 0→1 for this chapter boundary
   *  @param fromChapter — The departing chapter meta
   *  @param toChapter — The arriving chapter meta */
  tick(
    fromId: SectionId,
    toId: SectionId,
    progress: number,
    _fromChapter: ChapterMeta,
    toChapter: ChapterMeta,
  ): void {
    // Reset triggered pulses when chapter transition changes
    if (fromId !== previousFromId || toId !== previousToId) {
      triggeredPulses = new Set();
      previousFromId = fromId;
      previousToId = toId;
    }

    const content = toChapter.content;
    if (!content) {
      // No content animation config — fade everything out
      current = {
        chapterId: toId,
        chapterProgress: progress,
        cardProgress: 0,
        highlightedUnitIndices: [],
        titleProgress: 0,
        ledPulseActive: new Set(),
      };
      notify();
      return;
    }

    /* ─── Title reveal progress ───
       Starts at sectionTitleAtProgress, ramps to 1 over 15% of progress.
       e.g. at 0.05 progress → 0. At 0.20 progress → 1. */
    const titleProgress = clamp(
      (progress - content.sectionTitleAtProgress) / 0.15,
      0,
      1,
    );

    /* ─── Card stagger progress ───
       Remap from [cardStaggerWindow[0], cardStaggerWindow[1]] → [0, 1] */
    const [winStart, winEnd] = content.cardStaggerWindow;
    const cardProgress = clamp(
      (progress - winStart) / (winEnd - winStart),
      0,
      1,
    );

    /* ─── LED highlights from unitHighlightMap ─── */
    const highlightedUnitIndices = computeHighlights(cardProgress, content.unitHighlightMap);

    /* ─── LED pulses from ledPulseAt ─── */
    const ledPulseActive = content.ledPulseAt
      ? computeLedPulses(progress, content.ledPulseAt)
      : new Set<number>();

    current = {
      chapterId: toId,
      chapterProgress: progress,
      cardProgress,
      highlightedUnitIndices: [
        ...new Set([...highlightedUnitIndices, ...ledPulseActive]),
      ],
      titleProgress,
      ledPulseActive,
    };

    notify();
  },

  /** Reset state for a fresh start (e.g. after chapter transition ends) */
  reset(): void {
    current = { ...DEFAULT_STATE, ledPulseActive: new Set() };
    triggeredPulses = new Set();
    previousFromId = null;
    previousToId = null;
    notify();
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
