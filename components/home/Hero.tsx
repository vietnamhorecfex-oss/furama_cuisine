'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { homeSections } from '@/lib/content/home-sections';
import type { HeroSlide } from '@/lib/content/types';
import { formatMessage } from '@/lib/i18n/format';
import type { Copy } from '@/lib/i18n/registry';
import { useSite } from '@/components/site/SiteProvider';
import { CmsImage, cmsPictureProps } from '@/components/ui/CmsImage';
import { SplitWords } from '@/components/ui/SplitWords';
import { useMotionAllowed } from '@/lib/motion';
import { HERO_VIDEO } from '@/lib/media/hero-video';

/** The hero's headline, a line each (registry hero.title_*, spec §7.2 content/hero). */
const titleOf = (copy: Copy<'hero'>) => [copy['hero.title_1'], copy['hero.title_2'], copy['hero.title_3']] as const;

/**
 * The home page's <h1> when it has no hero (switched off, or no slide with a
 * picture: homeSections). The hero holds the page's only <h1>, and without it
 * the page would have none, so this names the page with the hero's own words
 * (the same keys, L7-16), visually hidden.
 */
export function HeroHeading({ copy }: { copy: Copy<'hero'> }) {
  return <h1 className="sr-only">{titleOf(copy).join(' ')}</h1>;
}

/*
 * One hero serves every width: the three cross-fading slides run on desktop,
 * while a phone gets a single art-directed crop, the shorter two-line headline
 * and the sheet trigger. Rendering one element keeps a single <h1> and a single
 * #top anchor instead of duplicating the section per breakpoint. The slides
 * (hero_slides) come from the page; the pace (site_settings.hero_autoplay_ms)
 * and which buttons show (the film and finder sections, homeSections) from the chrome.
 * Pictures go through next/image's optimiser (R3; components/ui/CmsImage.tsx); slide 1
 * is an art-directed <picture> of both files' optimised srcsets.
 *
 * The background film (HERO_VIDEO, lib/media/hero-video.ts, owner 2026-11-09) takes the slideshow's place for a
 * guest who allows motion, does not save data and is not on a slow connection: it loads once the page has (and the
 * browser is idle) and fades in over slide 1 once it runs,
 * so slide 1 is its poster and the first paint, and it has its own pause button on every width (WCAG 2.2.2). A guest
 * who reduces motion, saves data or is on a slow connection gets the slides as before (still, with their dots), so the slides staff manage
 * on the hero screen still show.
 */
export function Hero({ slides, copy }: { slides: HeroSlide[]; copy: Copy<'hero'> }) {
  const { site, open, overlay, scrollToId, locale } = useSite();
  const TITLE = titleOf(copy);
  const [slide, setSlide] = useState(0);
  // The slide being wiped over stays whole underneath until the new one covers it.
  const [prev, setPrev] = useState<number | null>(null);
  const current = useRef(0);
  const go = useCallback((next: (s: number) => number) => {
    const from = current.current;
    const to = next(from);
    if (to === from) return;
    current.current = to;
    setPrev(from);
    setSlide(to);
  }, []);
  const count = slides.length;
  // WCAG 2.2.2: a slideshow that moves on its own for more than five seconds needs a way to stop it.
  // `motion` is whether it may run at all (not when motion is reduced); `paused` is the guest's choice.
  const motionAllowed = useMotionAllowed();
  const filmOn = useFilmAllowed(HERO_VIDEO.length > 0 && motionAllowed);
  // Whether the browser has decided between film and slideshow: the server's HTML cannot know (motion, Save-Data).
  const decided = useSyncExternalStore(noSubscribe, () => true, () => false);
  const motion = motionAllowed && count > 1 && !filmOn;
  const [paused, setPaused] = useState(false);
  const [filmRunning, setFilmRunning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  /* The film's file is fetched once the page has loaded and the browser is idle: it is 2.2MB on a phone, and it
     came straight after hydration, alongside the page's own pictures (UX/UI audit 2026-11-15, PERF-05). */
  const [filmLoads, setFilmLoads] = useState(false);
  useEffect(() => {
    if (!filmOn) return;
    let idle = 0;
    const start = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => setFilmLoads(true), { timeout: 2000 }) : window.setTimeout(() => setFilmLoads(true), 200);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [filmOn]);

  /* The film runs while the hero is the guest's view: not behind an overlay, not once they paused it. */
  useEffect(() => {
    const el = video.current;
    if (!filmOn || !el) return;
    if (overlay || paused) el.pause();
    else el.play().catch(() => {});
  }, [filmOn, overlay, paused]);
  const autoplayMs = site.settings.heroAutoplayMs;
  const shown = homeSections(site.sections);

  /* Slideshow: desktop only, paused behind an overlay or a hidden tab. It lives
     in the hero, so it stops whenever the home page is not on screen. */
  useEffect(() => {
    if (overlay || paused || !motion) return;
    const timer = window.setInterval(() => {
      if (document.hidden || window.innerWidth < 760) return;
      go((s) => (s + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, count, go, motion, overlay, paused]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="top" className="hero" data-film={filmOn || undefined} style={{ ['--hero-ms' as string]: `${autoplayMs}ms` }}>
      <div className="hero-slides">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="hero-slide"
            data-active={i === slide}
            data-prev={i === prev && i !== slide ? true : undefined}
            data-wipe={i === slide && prev !== null ? true : undefined}
            data-parallax="0.3"
            aria-hidden={i !== slide}
          >
            <div className="hero-slide-zoom">
              {i === 0 ? (
                // Phones show only this slide, in its own crop (spec §6.5).
                <FirstSlide slide={s} />
              ) : (
                // The other slides only once the browser knows the slideshow runs: in the server's HTML they were
                // fetched before the film took their place (on screen, so `lazy` did not hold them back), 630KB
                // a desktop visit never showed (UX/UI audit 2026-11-15, PERF-04).
                decided &&
                !filmOn && <CmsImage media={s.image} sizes="100vw" width={s.image.width} height={s.image.height} className="fill" loading="lazy" />
              )}
            </div>
          </div>
        ))}
        {filmOn && filmLoads && (
          <div className="hero-film-layer" data-running={filmRunning || undefined} data-parallax="0.3">
            <video
              ref={video}
              className="fill"
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              aria-hidden="true"
              onPlaying={() => setFilmRunning(true)}
            >
              {HERO_VIDEO.map((v) => (
                <source key={v.src} src={v.src} media={v.media} type="video/mp4" />
              ))}
            </video>
          </div>
        )}
      </div>

      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-content" data-hero-content="1">
        <div className="hero-copy">
          {/* Each word rises on its own (SplitWords); the lines still read as one heading. The header's logo
              names the brand just above, so no label repeats it here. */}
          <h1 className="hero-title">
            <span className="hero-line">
              <SplitWords text={TITLE[0]} intro={1} />
            </span>{' '}
            <span className="hero-line hero-title-mid">
              <SplitWords text={TITLE[1]} intro={2} />
            </span>{' '}
            <span className="hero-line">
              <SplitWords text={TITLE[2]} intro={3} />
            </span>
          </h1>

          <p className="hero-lede" data-intro="4">
            {copy['hero.lede']}
          </p>

          <div className="hero-actions" data-intro="5">
            <button type="button" className="btn-slab hero-explore" data-magnetic="" onClick={() => scrollToId('restaurants')}>
              {copy['hero.cta_explore']}
              <span aria-hidden="true" className="hero-arrow">→</span>
            </button>

            {shown.has('film') && (
              <button type="button" className="hero-film" data-magnetic="" onClick={() => open('film')}>
                <span className="hero-play">
                  <span className="hero-play-tri" />
                </span>
                {copy['hero.cta_film']}
              </button>
            )}

            {shown.has('finder') && (
              <button type="button" className="hero-find" onClick={() => open('sheet')}>
                {copy['hero.cta_find']}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          {filmOn ? (
            <div className="hero-dots" data-film="">
              <button
                type="button"
                className="hero-pause"
                data-ready={filmRunning || undefined}
                aria-label={paused ? copy['hero.video_play_aria'] : copy['hero.video_pause_aria']}
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
              >
                <span aria-hidden="true" data-paused={paused} />
              </button>
            </div>
          ) : count > 1 ? (
            // Without the film, the row still holds the film's pause row's place on a phone (styles/home.css): the server
            // cannot know which a phone gets, and the row arriving or leaving after hydration moved the hero's copy
            // (CLS 0.028, UX/UI audit, PERF-08).
            <div className="hero-dots" data-intro="6" data-film-maybe={HERO_VIDEO.length > 0 ? '' : undefined}>
              <span className="hero-count" aria-hidden="true">
                <span className="hero-count-now">{pad(slide + 1)}</span>
                <span className="hero-count-of">{pad(count)}</span>
              </span>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={formatMessage(copy['hero.slide_aria'], { n: i + 1 }, locale)}
                  aria-current={i === slide}
                  onClick={() => go(() => i)}
                  className="hero-dot"
                >
                  {/* The live dot fills over the slide's time (--hero-ms), like a progress bar. */}
                  <span data-active={i === slide} data-run={i === slide && !overlay && !paused && motion ? true : undefined} />
                </button>
              ))}
              {motion && (
                <button
                  type="button"
                  className="hero-pause"
                  aria-label={paused ? copy['hero.play_aria'] : copy['hero.pause_aria']}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                >
                  <span aria-hidden="true" data-paused={paused} />
                </button>
              )}
            </div>
          ) : (
            HERO_VIDEO.length > 0 && <div className="hero-dots" data-film-maybe="" aria-hidden="true" />
          )}
        </div>

        {/* A drop of light down a hairline: there is more below. */}
        <span className="hero-scroll" aria-hidden="true">
          <span />
        </span>
      </div>
    </section>
  );
}

/**
 * Slide 1: the art-directed <picture> (desktop file + phone crop), both optimised (components/ui/CmsImage.tsx).
 * The phone crop is upright: a phone on its side gets the wide desktop file, which its wide, short hero crops far less.
 */
function FirstSlide({ slide }: { slide: HeroSlide }) {
  const { img, mobileSrcSet } = cmsPictureProps(slide.image, slide.mobile, { sizes: '100vw', priority: true });
  return (
    <picture>
      {mobileSrcSet && <source media="(max-width: 759px) and (orientation: portrait)" srcSet={mobileSrcSet} sizes="100vw" />}
      <img {...img} alt={slide.image.alt} className="fill" />
    </picture>
  );
}

/**
 * Whether the background film may load: motion allowed (passed in), the guest's browser not asking to save data, and
 * a connection the browser does not rate as 3G or slower (a 2.2MB film over it would take most of a minute).
 * False on the server and in the first render, so the film never competes with the poster for the first paint.
 */
function useFilmAllowed(allowed: boolean): boolean {
  const light = useSyncExternalStore(noSubscribe, readLightData, () => true);
  return allowed && !light;
}

const noSubscribe = () => () => {};
const SLOW_NETWORKS = new Set(['slow-2g', '2g', '3g']);
const readLightData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return c?.saveData === true || SLOW_NETWORKS.has(c?.effectiveType ?? '');
};
