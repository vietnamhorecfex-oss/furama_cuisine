/*
 * The home hero's background film (owner, 2026-11-09): a silent 27 s loop of the resort, the buffets and the city,
 * in place of the cross-fading slides. Encoded from the owner's 1920×1080 cut (furama-dining-hero-1920.mp4) with
 * its fade from black trimmed, H.264 with no sound track and the index first (faststart), so it starts streaming
 * at once:
 *   ffmpeg -ss 0.4 -i in.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -b:v 1100k -pass 1|2 … hero-film-1920.mp4
 *   ffmpeg -ss 0.4 -i in.mp4 -an -vf scale=960:-2 … -b:v 550k … hero-film-960.mp4
 * Slide 1's picture stays under it as the poster: the first paint, the page's largest image, and all a guest sees
 * when motion is reduced or data is saved (components/home/Hero.tsx).
 */

export type HeroVideoSource = { src: string; media?: string };

/** The film's files, smallest first: the browser plays the first whose media query matches. */
export const HERO_VIDEO: readonly HeroVideoSource[] = [
  { src: '/video/hero-film-960.mp4', media: '(max-width: 959px)' },
  { src: '/video/hero-film-1920.mp4' },
];
