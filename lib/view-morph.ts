import { readMotionLevel } from '@/lib/motion';

/*
 * The restaurant card's picture grows into the restaurant page's portrait (R2, E1): one object moving instead of
 * the brand curtain covering the swap. React's <ViewTransition> pairs the two by name during the route change
 * (node_modules/next/dist/docs/01-app/02-guides/view-transitions.md, "Morph a thumbnail into a hero image").
 * Same-document view transitions are Baseline since October 2025; a browser without them, or a guest who asks
 * for reduced motion, keeps the curtain.
 */

/** The shared name of a restaurant's card picture and its page's portrait: one per page, so a slug alone. */
export const restaurantMorphName = (slug: string) => `restaurant-${slug}`;

/** Whether the next route change may morph: the browser has view transitions and motion is not reduced. */
export function canMorph(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document && readMotionLevel() > 0;
}
