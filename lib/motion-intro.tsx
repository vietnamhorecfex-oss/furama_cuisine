'use client';

import { useEffect, type RefObject } from 'react';
import { INTRO_SEEN_KEY } from '@/lib/intro-landing';
import { DUR_REVEAL, EASE_INOUT, EASE_OUT, readMotionLevel, useMotion } from '@/lib/motion';

/*
 * A page's entrance: the staggered [data-intro] elements (IntroTrigger) and
 * the opening curtain they wait for (IntroCurtain). Split from lib/motion.tsx,
 * which keeps the scroll reveals and the scroll loop.
 */

export type IntroKind = 'rise' | 'line' | 'clip' | 'word';

const INTRO_FRAMES: Record<IntroKind, Keyframe[]> = {
  rise: [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
  line: [{ transform: 'translateY(110%)' }, { transform: 'none' }],
  clip: [{ clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
  // The hero's words: up out of the line's mask, out of a blur, a touch of tilt.
  word: [
    { transform: 'translateY(110%) rotate(5deg)', filter: 'blur(8px)', opacity: 0 },
    { transform: 'none', filter: 'blur(0)', opacity: 1 },
  ],
};

/**
 * The opening curtain (components/site/IntroCurtain.tsx) claims the first
 * visit of a session; while it covers the page the entrance waits for it, so
 * the hero's words rise as the curtain parts instead of underneath it.
 */
let curtainLiftsAt = 0;

/**
 * Set just before a route change that morphs a picture into the next page (lib/view-morph.ts): that page's
 * [data-intro-morph] element is the morph's landing, so it shows at once instead of playing its own entrance
 * (a clip wiping in under the moving picture). Read and cleared by the next page's entrance.
 */
let morphArrival = false;

export function expectMorphArrival() {
  morphArrival = true;
}

export { isHomeLanding } from '@/lib/intro-landing';

/**
 * The session's first page, once React runs (components/site/IntroCurtain.tsx). Marks the session as having had its
 * card, whatever the page, so a guest who landed on a restaurant page meets none later. When the before-paint script
 * chose to play it ([data-intro="play"], lib/intro-landing.ts), records when the curtain lifts, counted from the
 * moment it started rather than from hydration, so the hero's words rise as it parts; returns that start, else null.
 */
export function claimIntroCurtain(lift: number): number | null {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Storage refused (a private window): the card can still play this once.
  }
  const root = document.documentElement;
  if (root.dataset.intro !== 'play' || !readMotionLevel()) return null;
  const at = Number(root.dataset.introAt);
  const start = Number.isFinite(at) ? at : performance.now();
  curtainLiftsAt = start + lift;
  return start;
}

/**
 * Staggered page entrance for `[data-intro]` elements, ordered by their
 * `data-intro` index. Both keyframes are explicit so `fill: backwards` holds the
 * hidden state through the delay — a single target keyframe would resolve its
 * start against the already-visible element and animate nothing.
 */
export function useIntro(active: boolean, baseDelay = 0, root?: RefObject<HTMLElement | null> | null) {
  const motion = useMotion();

  useEffect(() => {
    if (!active) return;
    const scope: ParentNode | null = root ? root.current : document;
    if (!scope) return;
    const all = Array.from(scope.querySelectorAll<HTMLElement>('[data-intro]'));
    const morphed = morphArrival;
    morphArrival = false;
    const els = all.filter((el) => {
      if (el.hasAttribute('data-intro-done')) return false;
      if (morphed && el.hasAttribute('data-intro-morph')) {
        el.setAttribute('data-intro-done', '');
        return false;
      }
      return true;
    });
    if (!els.length) return;

    const timer = window.setTimeout(() => {
      const curtain = Math.max(0, curtainLiftsAt - performance.now());
      els.forEach((el) => {
        const kind = (el.getAttribute('data-intro-kind') as IntroKind) || 'rise';
        el.setAttribute('data-intro-done', '');
        if (!motion || !el.animate) return;
        const i = Number(el.getAttribute('data-intro')) || 0;
        // Words of one line follow each other (data-intro-sub).
        const sub = Number(el.getAttribute('data-intro-sub')) || 0;
        const a = el.animate(INTRO_FRAMES[kind], {
          duration: DUR_REVEAL,
          delay: curtain + baseDelay + i * 60 + sub * 40,
          easing: kind === 'clip' ? EASE_INOUT : EASE_OUT,
          fill: 'backwards',
        });
        a.finished.then(() => a.cancel()).catch(() => {});
      });
    }, 30);

    return () => {
      window.clearTimeout(timer);
      // A page hidden by <Activity> keeps its DOM; re-arm the entrance so it
      // plays again when the page is shown (its effects re-run then).
      if (root) all.forEach((el) => el.removeAttribute('data-intro-done'));
    };
  }, [active, baseDelay, motion, root]);
}
