'use client';

import { useEffect, useState } from 'react';
import { claimIntroCurtain } from '@/lib/motion-intro';

/** When the curtain's two halves start to part (styles/motion.css): the hero's words rise from then. */
const LIFT_MS = 500;
/** When it is gone and leaves the page: 800 ms in all (the motion budget, styles/tokens.css). */
const GONE_MS = 800;

const WORD = 'FURAMA';

/**
 * Opening title card, once per session, on a home page, never when motion is reduced, from the first frame: the
 * wordmark's letters rise one by one, a gold rule draws under them, then the
 * card splits in two and the halves slide away from the hero.
 */
export function IntroCurtain() {
  // Rendered from the server on, so the card is in the first frame's HTML; its CSS shows it only under
  // <html data-intro="play">, which the guest root layout's before-paint script sets (lib/intro-landing.ts).
  const [present, setPresent] = useState(true);

  useEffect(() => {
    const start = claimIntroCurtain(LIFT_MS);
    const root = document.documentElement;
    const done = () => {
      setPresent(false);
      delete root.dataset.intro;
      delete root.dataset.introAt;
    };
    if (start === null) {
      done();
      return;
    }
    // Its timeline runs from the first paint (CSS), not from now: it leaves when that 800 ms is up.
    const timer = window.setTimeout(done, Math.max(0, start + GONE_MS - performance.now()));
    return () => window.clearTimeout(timer);
  }, []);

  if (!present) return null;

  return (
    <div className="intro-curtain" aria-hidden="true">
      <span className="intro-curtain-half intro-curtain-top" />
      <span className="intro-curtain-half intro-curtain-bottom" />
      <div className="intro-curtain-card">
        <div className="intro-curtain-word">
          {WORD.split('').map((letter, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>
              {letter}
            </span>
          ))}
        </div>
        <div className="intro-curtain-rule" />
        <div className="intro-curtain-sub">DINING WORLD</div>
      </div>
    </div>
  );
}
