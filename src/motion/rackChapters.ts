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

export type ChapterMeta = {
  id: SectionId;
  title: string;
  rack: RackChapterState;
  /** CSS background for section scrim (null = none) */
  scrim: string | null;
};

/* ─── Desktop hero camera (matches useRackScene camEnd) ─── */
const DESKTOP_HERO: RackChapterState = {
  opacity: 1,
  cameraPos: { x: 0, y: 1.9, z: 13 },
  cameraLook: { x: 0, y: 1.9, z: -0.6 },
  groupX: 0,
  groupY: 0,
  groupZ: 0,
  groupScale: 1,
  groupRotY: 0,
  parallax: true,
  active: true,
};

const MOBILE_HERO: RackChapterState = {
  opacity: 1,
  cameraPos: { x: 0, y: 5, z: 35 },
  cameraLook: { x: 0, y: 1.5, z: 0 },
  groupX: 0,
  groupY: 0,
  groupZ: 0,
  groupScale: 1,
  groupRotY: 0,
  parallax: false,
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
        opacity: 0.38,
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
        'linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.88) 35%, rgba(10,10,10,0.94) 100%)',
    },
    {
      id: 'changelog',
      title: 'The Journey',
      rack: {
        opacity: 0.14,
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
        'linear-gradient(180deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.92) 50%, rgba(10,10,10,0.96) 100%)',
    },
    {
      id: 'stack',
      title: 'The Stack',
      rack: {
        opacity: 0.08,
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
        'linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.95) 100%)',
    },
    {
      id: 'contact',
      title: 'Get in Touch',
      rack: {
        opacity: 0,
        cameraPos: { x: 0, y: 8, z: 32 },
        cameraLook: { x: 0, y: 0, z: 0 },
        groupX: -10,
        groupY: -1.5,
        groupZ: -3,
        groupScale: 0.55,
        groupRotY: 0.35,
        parallax: false,
        active: false,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.98) 100%)',
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
        opacity: 0,
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0,
        groupY: 0,
        groupZ: 0,
        groupScale: 1,
        groupRotY: 0,
        parallax: false,
        active: false,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.96) 100%)',
    },
    {
      id: 'changelog',
      title: 'The Journey',
      rack: {
        opacity: 0,
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0,
        groupY: 0,
        groupZ: 0,
        groupScale: 1,
        groupRotY: 0,
        parallax: false,
        active: false,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.96) 100%)',
    },
    {
      id: 'stack',
      title: 'The Stack',
      rack: {
        opacity: 0,
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0,
        groupY: 0,
        groupZ: 0,
        groupScale: 1,
        groupRotY: 0,
        parallax: false,
        active: false,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.97) 100%)',
    },
    {
      id: 'contact',
      title: 'Get in Touch',
      rack: {
        opacity: 0,
        cameraPos: MOBILE_HERO.cameraPos,
        cameraLook: MOBILE_HERO.cameraLook,
        groupX: 0,
        groupY: 0,
        groupZ: 0,
        groupScale: 1,
        groupRotY: 0,
        parallax: false,
        active: false,
      },
      scrim:
        'linear-gradient(180deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.99) 100%)',
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
