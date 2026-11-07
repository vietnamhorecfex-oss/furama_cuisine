'use client';

import { useEffect, useRef } from 'react';
import { DUR_BASE, readMotionLevel } from '@/lib/motion';
import { useSite } from '@/components/site/SiteProvider';

/*
 * The brand curtain that covers a view swap: it wipes in, the route changes
 * underneath it, then it wipes back off. The element is held in a module-level
 * ref and driven with the Web Animations API so navigation never waits on a
 * React re-render, and a stalled route change still resolves via the fallback.
 */
let curtain: HTMLElement | null = null;
let busy = false;

export function coverThen(swap: () => void) {
  if (!curtain || !curtain.animate || !readMotionLevel()) {
    swap();
    return;
  }
  if (busy) return;
  busy = true;

  curtain.dataset.active = 'true';
  const inAnim = curtain.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 300,
    easing: 'ease',
    fill: 'forwards',
  });

  let swapped = false;
  const run = () => {
    if (swapped) return;
    swapped = true;
    window.clearTimeout(fallback);
    swap();
  };
  const fallback = window.setTimeout(run, 900);
  inAnim.finished.then(run).catch(run);
}

function uncover() {
  // Only a page the curtain covered: a route change without it (the card's picture morphing, lib/view-morph.ts;
  // the browser's back and forward) would otherwise flash the curtain in at full and fade it over the new page.
  if (!curtain || !busy) return;
  busy = false;
  if (!curtain.animate || !readMotionLevel()) {
    curtain.style.opacity = '0';
    curtain.dataset.active = 'false';
    return;
  }
  const out = curtain.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: DUR_BASE,
    delay: 100,
    easing: 'ease',
    fill: 'forwards',
  });
  out.finished
    .then(() => {
      if (!curtain) return;
      curtain.dataset.active = 'false';
      out.cancel();
      curtain.style.opacity = '0';
    })
    .catch(() => {});
}

export function PageCurtain() {
  const ref = useRef<HTMLDivElement>(null);
  // The page on screen, from its <ViewMarker>: it changes once the new page has
  // actually rendered, so the curtain lifts onto content rather than a fallback.
  const { pageRoot } = useSite();
  const shown = useRef<HTMLElement | null>(null);

  useEffect(() => {
    curtain = ref.current;
    // A previous mount can have been unmounted mid-cover (the error page replaces
    // this subtree): its `busy` and its inline curtain state must not carry over.
    busy = false;
    if (curtain) {
      curtain.getAnimations?.().forEach((a) => a.cancel());
      curtain.style.opacity = '';
      // Only when it differs: the markup already says 'false', and a write of
      // the same value is still an attribute mutation that observers record.
      if (curtain.dataset.active !== 'false') curtain.dataset.active = 'false';
    }
    return () => {
      curtain = null;
    };
  }, []);

  useEffect(() => {
    if (!pageRoot || pageRoot === shown.current) return;
    const first = shown.current === null;
    shown.current = pageRoot;
    if (!first) uncover();
  }, [pageRoot]);

  return (
    <div ref={ref} className="page-curtain" data-active="false" aria-hidden="true">
      <span>FURAMA</span>
    </div>
  );
}
