/*
 * Furama Dining World's mark, "Ấn sóng" (the seal of waves), on a 64 × 64
 * grid: three arcs rising off a horizon, a sun above them, the initials FDW
 * under it, in a ring. From the brand's logo set (public/brand/, designed
 * 2026-10-15); the favicons in app/ come from the same set. The site's
 * <BrandMark> (components/ui) and the admin's (app/admin/(shell)/_ui) draw it
 * inline: the arcs take the text colour, the rest `.brand-mark-gold`'s.
 */

/** The ring: a stroke, 1.5 wide. */
export const BRAND_MARK_RING = { cx: 32, cy: 32, r: 29.5 };

/** The three arcs: a stroke, 2 wide. */
export const BRAND_MARK_WAVES = 'M14 44A18 18 0 0 1 50 44M19.5 44A12.5 12.5 0 0 1 44.5 44M25 44A7 7 0 0 1 39 44';

/** The horizon: a stroke, 1.5 wide. */
export const BRAND_MARK_HORIZON = 'M9 44H55';

/** The sun: a dot. */
export const BRAND_MARK_SUN = { cx: 32, cy: 21.2, r: 2 };

/** FDW in Be Vietnam Pro 500, outlined: a fill. Too small to read under about 48 px, where it is left out. */
export const BRAND_MARK_INITIALS =
  'M23.27 54.6V50.16H26.26V50.77H23.97V52.13H25.98V52.74H23.97V54.6ZM29.09 54.6V50.16H30.61Q31.14 50.16 31.55 50.35Q31.95 50.54 32.22 50.86Q32.48 51.17 32.62 51.57Q32.75 51.97 32.75 52.38Q32.75 52.79 32.62 53.19Q32.48 53.59 32.22 53.9Q31.95 54.22 31.55 54.41Q31.14 54.6 30.61 54.6ZM30.58 50.77H29.79V53.98H30.58Q30.95 53.98 31.23 53.85Q31.5 53.71 31.68 53.48Q31.86 53.25 31.96 52.97Q32.05 52.68 32.05 52.38Q32.05 52.08 31.96 51.79Q31.86 51.5 31.68 51.28Q31.5 51.05 31.23 50.91Q30.95 50.77 30.58 50.77ZM36.43 54.6 35.27 50.16H35.98L36.85 53.62L37.77 50.16H38.47L39.39 53.61L40.25 50.16H40.97L39.81 54.6H38.97L38.12 51.38L37.27 54.6Z';
