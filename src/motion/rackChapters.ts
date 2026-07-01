/* ─── rackChapters.ts ─── */
/* ═══════════════════════════════════════════════════════
   rackChapters — scroll chapter config for the global rack

   Single source of truth for rack camera/opacity per section
   and HTML scrim overlays for text legibility.
   ═══════════════════════════════════════════════════════ */

export const SECTION_IDS = ['status', 'services', 'changelog', 'stack', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type Vec3 = { x: number; y: number; z: number };

export type RackChapterState = {
  opacity: number;
  cameraPos: Vec3;
  cameraLook: Vec3;
  groupX: number;
  groupY: number;
  groupZ: number;
  groupScale: number;
  groupRotY: number;
  parallax: boolean;
  /** Skip WebGL render when false (opacity also gates in tick) */
  active: boolean;
};

/* ═══════════════════════════════════════════════════════
   ContentPhase — scroll-driven content animation config

   Defines how section content (cards, labels, titles)
   responds to the same scroll progress that drives the
   rack camera/opacity state.

   Used by contentDirector and useContentAnimations.
   ═══════════════════════════════════════════════════════ */
export type ContentPhase = {
  /** Progress range for card stagger: [start, end].
   *  Cards enter between start*progress and end*progress
   *  of the chapter transition. Default: [0.1, 0.7]. */
  cardStaggerWindow: [number, number];

  /** Maps card index to rack unit LED index.
   *  When a card enters, the corresponding rack LED pulses.
   *  -1 means no highlight. */
  unitHighlightMap: Record<number, number>;

  /** Progress at which section label, title, and gold accent line
   *  begin their reveal animation. Default: 0.05. */
  sectionTitleAtProgress: number;

  /** Changelog-specific: entries that trigger brief LED flashes.
   *  Each entry specifies the progress point (0→1 across the
   *  chapter transition) and which rack unit LED to flash.
   *  unitIndex -1 = flash all LEDs. */
  ledPulseAt?: { progress: number; unitIndex: number }[];
};

export type ChapterMeta = {
  id: SectionId;
  title: string;
  rack: RackChapterState;
  /** CSS background for section scrim (null = none) */
  scrim: string | null;
  /** Scroll-driven content animation config (Phase 3 co-animation) */
  content?: ContentPhase;
};

/* ─── Desktop hero camera (matches useRackScene camEnd) ─── */
const DESKTOP_HERO: RackChapterState = {
  opacity: 1.0,
  cameraPos: { x: 0, y: 1.9, z: 13 },
  cameraLook: { x: 0, y: 1.9, z: -0.6 },
  groupX: 2.5,
  groupY: 0,
  groupZ: 0,
  groupScale: 0.85,
  groupRotY: -0.15,
  parallax: true,
  active: true,
};

const MOBILE_HERO: RackChapterState = {
  opacity: 0.85,
  cameraPos: { x: 0, y: 6.5, z: 35 },
  cameraLook: { x: 0, y: 0.5, z: 0 },
  groupX: 0,
  groupY: 0,
  groupZ: 0,
  groupScale: 0.95,
  groupRotY: -0.08,
  parallax: true,
  active: true,
};

function desktopChapters(): ChapterMeta[] {
  return [
    {
      id: 'status',
      title: 'Mukthanand Reddy',
      rack: DESKTOP_HERO,
      scrim: null,
    },
    {
      id: 'services',
      title: 'Selected Work',
      rack: {
        opacity: 0.75, // Highly visible background rack
        cameraPos: { x: 5.5, y: 3.2, z: 18 },
        cameraLook: { x: -1.5, y: 1.6, z: -0.5 },
        groupX: -3.2,
        groupY: -0.4,
        groupZ: 0,
        groupScale: 0.88,
        groupRotY: 0.12,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.50) 45%, rgba(10,10,10,0.70) 100%)',
      content: {
        cardStaggerWindow: [0.1, 0.7],
        unitHighlightMap: {
          0: 4,   // Ask Your Corpus → hero unit 1 (/retrieve), LED #4 (middle of 3)
          1: 7,   // Scheme Saathi → hero unit 2 (/chat), LED #7 (middle of 3)
          2: 16,  // FAQ Sense → side rack left unit 0, LED #16 (middle of 3)
          3: -1,  // MediFlow AI (archived) — no highlight
        },
        sectionTitleAtProgress: 0.05,
      },
    },
    {
      id: 'changelog',
      title: 'The Journey',
      rack: {
        opacity: 0.65, // Soft, glowing server outline
        cameraPos: { x: 0, y: 4.5, z: 24 },
        cameraLook: { x: 0, y: 1.2, z: 0 },
        groupX: -6,
        groupY: -0.8,
        groupZ: -1,
        groupScale: 0.75,
        groupRotY: 0.2,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.70) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.75) 100%)',
      content: {
        cardStaggerWindow: [0.15, 0.8],
        unitHighlightMap: {
          0: 4,   // v2.0.0 Graduation → hero unit 1 (/retrieve)
          1: 7,   // v1.4.0 Ask Your Corpus → hero unit 2 (/chat)
          2: 10,  // v1.3.0 Scheme Saathi → hero unit 3 (/agentic)
          3: 16,  // v1.2.0 EHRS → side rack left
          4: 13,  // v1.1.0 Viswam AI → hero unit 4 (/cache)
          5: 0,   // v1.0.0 First OSS → hero unit 0 (/status)
        },
        sectionTitleAtProgress: 0.05,
        ledPulseAt: [
          { progress: 0.15, unitIndex: -1 },  // v2.0.0 Graduation — major: all units
          { progress: 0.30, unitIndex: 4 },   // v1.4.0 Ask Your Corpus — unit 1
          { progress: 0.45, unitIndex: 7 },   // v1.3.0 Scheme Saathi — unit 2
          { progress: 0.60, unitIndex: 16 },  // v1.2.0 EHRS — side rack
          { progress: 0.75, unitIndex: 13 },  // v1.1.0 Viswam AI — unit 4
          { progress: 0.90, unitIndex: -1 },  // v1.0.0 First OSS — major: all units
        ],
      },
    },
    {
      id: 'stack',
      title: 'The Stack',
      rack: {
        opacity: 0.58, // Solid structural presence
        cameraPos: { x: -2, y: 6, z: 28 },
        cameraLook: { x: 0, y: 0.8, z: 0 },
        groupX: -8,
        groupY: -1.2,
        groupZ: -2,
        groupScale: 0.65,
        groupRotY: 0.28,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.60) 45%, rgba(10,10,10,0.80) 100%)',
      content: {
        cardStaggerWindow: [0.2, 0.75],
        unitHighlightMap: {},  // no rack unit highlights for stack section
        sectionTitleAtProgress: 0.05,
      },
    },
    {
      id: 'contact',
      title: 'Get in Touch',
      rack: {
        opacity: 0.50, // Clearly silhouetted in footer
        cameraPos: { x: 0, y: 8, z: 32 },
        cameraLook: { x: 0, y: 0, z: 0 },
        groupX: -10,
        groupY: -1.5,
        groupZ: -3,
        groupScale: 0.55,
        groupRotY: 0.35,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.80) 0%, rgba(10,10,10,0.65) 45%, rgba(10,10,10,0.85) 100%)',
      content: {
        cardStaggerWindow: [0.2, 0.6],
        unitHighlightMap: {},  // no rack unit highlights for contact section
        sectionTitleAtProgress: 0.05,
      },
    },
  ];
}

function mobileChapters(): ChapterMeta[] {
  return [
    {
      id: 'status',
      title: 'Mukthanand Reddy',
      rack: MOBILE_HERO,
      scrim: null,
    },
    {
      id: 'services',
      title: 'Selected Work',
      rack: {
        opacity: 0.70, // High mobile visibility
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: -0.6,
        groupY: 0.2,
        groupZ: -0.5,
        groupScale: 0.86,
        groupRotY: 0.16,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.20) 0%, rgba(10,10,10,0.50) 45%, rgba(10,10,10,0.65) 100%)',
      content: {
        cardStaggerWindow: [0.0, 0.3],  // mobile: fast entrance
        unitHighlightMap: {},            // mobile: no LED highlights (rack not visible)
        sectionTitleAtProgress: 0.05,
      },
    },
    {
      id: 'changelog',
      title: 'The Journey',
      rack: {
        opacity: 0.65, // High mobile visibility
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0.6,
        groupY: 0.4,
        groupZ: -1,
        groupScale: 0.78,
        groupRotY: -0.2,
        parallax: true,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.52) 45%, rgba(10,10,10,0.70) 100%)',
      content: {
        cardStaggerWindow: [0.0, 0.3],
        unitHighlightMap: {},
        sectionTitleAtProgress: 0.05,
      },
    },
    {
      id: 'stack',
      title: 'The Stack',
      rack: {
        opacity: 0.60, // High mobile visibility
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: -0.5,
        groupY: 0.5,
        groupZ: -1.2,
        groupScale: 0.7,
        groupRotY: 0.16,
        parallax: true,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.70) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.72) 100%)',
      content: {
        cardStaggerWindow: [0.0, 0.3],
        unitHighlightMap: {},
        sectionTitleAtProgress: 0.05,
      },
    },
    {
      id: 'contact',
      title: 'Get in Touch',
      rack: {
        opacity: 0.55, // High mobile visibility
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0,
        groupY: 0.6,
        groupZ: -2,
        groupScale: 0.6,
        groupRotY: -0.05,
        parallax: false,
        active: true,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.60) 45%, rgba(10,10,10,0.78) 100%)',
      content: {
        cardStaggerWindow: [0.0, 0.3],
        unitHighlightMap: {},
        sectionTitleAtProgress: 0.05,
      },
    },
  ];
}

export function getRackChapters(isMobile = window.innerWidth < 768): ChapterMeta[] {
  return isMobile ? mobileChapters() : desktopChapters();
}

export function getChapterMeta(id: SectionId, isMobile?: boolean): ChapterMeta | undefined {
  return getRackChapters(isMobile).find((c) => c.id === id);
}

export function lerpRackState(a: RackChapterState, b: RackChapterState, t: number): RackChapterState {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return {
    opacity: lerp(a.opacity, b.opacity),
    cameraPos: {
      x: lerp(a.cameraPos.x, b.cameraPos.x),
      y: lerp(a.cameraPos.y, b.cameraPos.y),
      z: lerp(a.cameraPos.z, b.cameraPos.z),
    },
    cameraLook: {
      x: lerp(a.cameraLook.x, b.cameraLook.x),
      y: lerp(a.cameraLook.y, b.cameraLook.y),
      z: lerp(a.cameraLook.z, b.cameraLook.z),
    },
    groupX: lerp(a.groupX, b.groupX),
    groupY: lerp(a.groupY, b.groupY),
    groupZ: lerp(a.groupZ, b.groupZ),
    groupScale: lerp(a.groupScale, b.groupScale),
    groupRotY: lerp(a.groupRotY, b.groupRotY),
    parallax: t < 0.5 ? a.parallax : b.parallax,
    active: lerp(a.opacity, b.opacity) > 0.04,
  };
}
