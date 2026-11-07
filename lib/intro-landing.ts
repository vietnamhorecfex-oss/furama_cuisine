/*
 * When the opening title card plays (components/site/IntroCurtain.tsx): on a language's home page, once per
 * session, never when motion is reduced. Plain, so the guest root layout's before-paint script (it decides, so the
 * card is there from the first frame instead of after hydration) and the client share one rule.
 */

/** sessionStorage key set once a session's first page has shown (or skipped) the card. */
export const INTRO_SEEN_KEY = 'fc-intro-seen';

/** A language's home page: "/en", "/vi/", "/zh-hans". */
export const HOME_LANDING_RE = /^\/[a-z]{2,3}(?:-[a-z0-9]+)*\/?$/;

/** The home page of a language ("/en", "/vi/", "/zh-hans"): the one page the opening curtain plays on. */
export function isHomeLanding(pathname: string): boolean {
  return HOME_LANDING_RE.test(pathname);
}

/**
 * The guest root layout's script, run in <head> before the first paint: [data-motion] for the scroll reveals and,
 * when the card should play, [data-intro="play"] with the moment it started ([data-intro-at], performance.now()).
 * The card's markup is in the server HTML and its CSS shows it only under [data-intro="play"], so it covers the page
 * from the first frame and its timeline starts there; without JavaScript it never shows.
 */
export const MOTION_BOOTSTRAP = `try{var d=document.documentElement,r=matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=r?'off':'on';if(!r&&${HOME_LANDING_RE.toString()}.test(location.pathname)&&!sessionStorage.getItem('${INTRO_SEEN_KEY}')){d.dataset.intro='play';d.dataset.introAt=String(Math.round(performance.now()))}}catch(e){}`;
