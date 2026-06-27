import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { getRackChapters, type SectionId } from './rackChapters';
import { rackDirector } from './rackDirector';
import { contentDirector } from './contentDirector';

gsap.registerPlugin(ScrollTrigger);

type Options = {
  bootComplete?: boolean;
  sectionIds?: SectionId[];
};

/* ═══════════════════════════════════════════════════════
   useRackScrollDirector — GSAP scrub between chapter states

   Drives rackDirector.current as the user scrolls between
   sections. Mobile uses faster fade-out after status.
   ═══════════════════════════════════════════════════════ */
export function useRackScrollDirector({
  bootComplete = true,
  sectionIds = ['status', 'services', 'changelog', 'stack', 'contact'],
}: Options = {}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!bootComplete) return;

    const isMobile = window.innerWidth < 768;
    const chapters = getRackChapters(isMobile);
    const chapterMap = new Map(chapters.map((c) => [c.id, c]));

    if (reduced) {
      const status = chapterMap.get('status');
      if (status) rackDirector.setState(status.rack);
      rackDirector.markIntroComplete();
      return;
    }

    rackDirector.resetForViewport(isMobile);

    const triggers: ScrollTrigger[] = [];

    /* ─── Scrub rack state between consecutive sections ─── */
    for (let i = 0; i < sectionIds.length - 1; i++) {
      const fromId = sectionIds[i];
      const toId = sectionIds[i + 1];
      const fromChapter = chapterMap.get(fromId);
      const toChapter = chapterMap.get(toId);
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);

      if (!fromChapter || !toChapter || !fromEl || !toEl) continue;

      const st = ScrollTrigger.create({
        id: `rack-chapter-${fromId}-${toId}`,
        trigger: fromEl,
        start: isMobile ? 'bottom 75%' : 'center center',
        endTrigger: toEl,
        end: isMobile ? 'top 25%' : 'center center',
        scrub: isMobile ? 0.6 : 1.2,
        invalidateOnRefresh: true,
        onUpdate(self) {
          rackDirector.lerpStates(fromChapter.rack, toChapter.rack, self.progress);
          contentDirector.tick(fromId, toId, self.progress, fromChapter, toChapter);
        },
        onLeave(self) {
          if (self.progress >= 0.98) {
            rackDirector.setState(toChapter.rack);
            rackDirector.setActiveSection(toId);
          }
        },
        onEnterBack: () => {
          rackDirector.setState(fromChapter.rack);
          rackDirector.setActiveSection(fromId);
        },
      });

      triggers.push(st);
    }

    /* ─── Snap active section when dominant ─── */
    sectionIds.forEach((id) => {
      const chapter = chapterMap.get(id);
      const el = document.getElementById(id);
      if (!chapter || !el) return;

      const st = ScrollTrigger.create({
        id: `rack-active-${id}`,
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => {
          rackDirector.setActiveSection(id);
        },
        onEnterBack: () => {
          rackDirector.setActiveSection(id);
        },
      });

      triggers.push(st);
    });

    const onResize = () => {
      const mobile = window.innerWidth < 768;
      rackDirector.resetForViewport(mobile);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      triggers.forEach((st) => st.kill());
    };
  }, [bootComplete, reduced, sectionIds.join(',')]);
}
