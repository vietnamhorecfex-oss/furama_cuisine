/*
 * Furama Dining World's mark: a jade frame of key-fret lines around a dark
 * green flower, its white field kept and the white outside it cut away. The
 * favicons in app/ (icon.png, favicon.ico, apple-icon.png) are the same mark.
 * The site's <BrandMark> (components/ui) and the admin's (app/admin/(shell)/_ui)
 * show this file; it is 147 px square, sharp up to about 70 CSS px on a 2x
 * screen. WebP (quality 90, 7KB) of the PNG next to it (30KB), which the
 * header preloads ahead of the first screen's image (UX/UI audit 2026-11-15,
 * PERF-09):
 *   sharp(png).webp({ quality: 90, alphaQuality: 90, effort: 6 })
 */
export const BRAND_MARK_SRC = '/brand/furama-dining-world-mark.webp';
export const BRAND_MARK_SIZE = 147;
