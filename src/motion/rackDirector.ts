import {
  getRackChapters,
  lerpRackState,
  type RackChapterState,
  type SectionId,
} from './rackChapters';

/* ═══════════════════════════════════════════════════════
   rackDirector — module-level scroll state for Three.js rack

   Written by useRackScrollDirector (GSAP ScrollTrigger).
   Read each frame by useRackScene tick loop.
   ═══════════════════════════════════════════════════════ */

const chapters = getRackChapters();
const initial = chapters[0]?.rack ?? {
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

let current: RackChapterState = { ...initial };
let introComplete = false;
let activeSection: SectionId = 'status';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const rackDirector = {
  get current() {
    return current;
  },
  get introComplete() {
    return introComplete;
  },
  get activeSection() {
    return activeSection;
  },

  setState(next: RackChapterState) {
    current = next;
    notify();
  },

  lerpStates(from: RackChapterState, to: RackChapterState, t: number) {
    current = lerpRackState(from, to, t);
    notify();
  },

  setActiveSection(id: SectionId) {
    activeSection = id;
    notify();
  },

  markIntroComplete() {
    introComplete = true;
    notify();
  },

  resetIntro() {
    introComplete = false;
  },

  /** Re-init chapter defaults after resize (mobile ↔ desktop) */
  resetForViewport(isMobile: boolean) {
    const next = getRackChapters(isMobile);
    if (next[0]) {
      current = { ...next[0].rack };
    }
    activeSection = 'status';
    notify();
  },

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
