import { describe, expect, it } from 'vitest';
import { INTRO_SEEN_KEY, MOTION_BOOTSTRAP } from './intro-landing';

/** Runs the before-paint script against a stand-in document; returns <html>'s dataset after it. */
function run({ path, seen = false, reduced = false }: { path: string; seen?: boolean; reduced?: boolean }) {
  const dataset: Record<string, string> = {};
  const globals = {
    document: { documentElement: { dataset } },
    matchMedia: () => ({ matches: reduced }),
    location: { pathname: path },
    sessionStorage: { getItem: (k: string) => (seen && k === INTRO_SEEN_KEY ? '1' : null) },
    performance: { now: () => 123.4 },
  };
  new Function(...Object.keys(globals), MOTION_BOOTSTRAP)(...Object.values(globals));
  return dataset;
}

describe('MOTION_BOOTSTRAP (before first paint)', () => {
  it('plays the title card on a home page, the session’s first, with motion: from the moment it ran', () => {
    expect(run({ path: '/en' })).toEqual({ motion: 'on', intro: 'play', introAt: '123' });
    expect(run({ path: '/zh-hans/' })).toMatchObject({ intro: 'play' });
  });

  it('plays none on another page, later in the session, or with motion reduced', () => {
    expect(run({ path: '/en/restaurants/taya-house' })).toEqual({ motion: 'on' });
    expect(run({ path: '/en', seen: true })).toEqual({ motion: 'on' });
    expect(run({ path: '/en', reduced: true })).toEqual({ motion: 'off' });
  });
});
