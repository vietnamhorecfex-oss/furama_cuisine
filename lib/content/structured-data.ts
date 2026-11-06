import type { Media, Phone } from './types';

/**
 * A restaurant page's schema.org Restaurant, for search engines and AI
 * answers (brief §5: SEO + GEO). Only what the page already shows: no
 * opening hours or ratings until the CMS holds them. Pure, so it is tested
 * without a page; the page renders it as application/ld+json.
 */
export type RestaurantSchemaInput = {
  name: string;
  /** The page's own address (origin + /<lang>/restaurants/<slug>). */
  url: string;
  origin: URL;
  lang: string;
  image: Media | null;
  phone: Phone | null;
  map: string | null;
  /** Its destination's postal address in this language; null leaves the address out. */
  address: string | null;
  cuisines: string[];
  bookingEnabled: boolean;
};

export function restaurantSchema(input: RestaurantSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: input.name,
    url: input.url,
    inLanguage: input.lang,
    acceptsReservations: input.bookingEnabled,
  };
  if (input.image) schema.image = new URL(input.image.url, input.origin).href;
  if (input.phone) schema.telephone = input.phone.tel;
  if (input.map) schema.hasMap = input.map;
  if (input.address) schema.address = { '@type': 'PostalAddress', streetAddress: input.address, addressCountry: 'VN' };
  if (input.cuisines.length > 0) schema.servesCuisine = input.cuisines;
  return schema;
}

/**
 * JSON for an inline <script>: "<" is escaped so no value (a name staff
 * typed) can close the element early.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
