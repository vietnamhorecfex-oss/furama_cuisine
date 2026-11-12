import 'server-only';
import vietnamese from '@/db/translation-packs/2026-11-vietnamese.json';
import type { Cuisine, Destination, Experience, HeroSlide, Highlight, Media, NavItem, Offer, RestaurantDetail, Sections, Story } from '@/lib/content/types';
import type { Restaurant } from '@/lib/data';

/*
 * The shipped translation packs as the guest pages' fallback (owner,
 * 2026-11-12): until staff apply a pack (/admin/translations, "Gói bản
 * dịch"), a field that still shows the very English a pack translated shows
 * the pack's translation instead. A translation staff saved wins (the field no
 * longer shows the English), and so does an English edit (it no longer
 * matches). Matched by list, column and English text, never by id: ids differ
 * between databases, and a list's same words read the same way.
 *
 * A pack is a reviewed file of the repository (db/translation-packs), the
 * same one the admin and scripts/apply-translation-pack.mjs apply; once it is
 * applied this changes nothing.
 */

type PackJson = { locale: string; items: ({ entity: string; en: Record<string, string> } & Record<string, unknown>)[] };

/** The packs shipped with the code, in the order they apply. */
export const SHIPPED_PACK_FILES: readonly { id: string; pack: PackJson }[] = [{ id: '2026-11-vietnamese', pack: vietnamese as unknown as PackJson }];

const key = (entity: string, column: string, english: string) => `${entity}\u0000${column}\u0000${english}`;

/** locale → (list, column, English) → translation. */
const BY_LOCALE = new Map<string, Map<string, string>>();
for (const { pack } of SHIPPED_PACK_FILES) {
  const map = BY_LOCALE.get(pack.locale) ?? new Map<string, string>();
  for (const item of pack.items) {
    const to = item[pack.locale] as Record<string, string> | undefined;
    for (const [column, text] of Object.entries(to ?? {})) {
      const english = item.en[column];
      if (english && !map.has(key(item.entity, column, english))) map.set(key(item.entity, column, english), text);
    }
  }
  BY_LOCALE.set(pack.locale, map);
}

/** The pack's translation of a field still showing its English, else the field as it is. */
function tr(locale: string, entity: string, column: string, value: string): string;
function tr(locale: string, entity: string, column: string, value: string | null): string | null;
function tr(locale: string, entity: string, column: string, value: string | null): string | null {
  if (value === null) return null;
  return BY_LOCALE.get(locale)?.get(key(entity, column, value)) ?? value;
}

/**
 * The same in a composed line ("Restaurant News · 9 Sep 2026", "VND 888,000++ per guest · Nightly 18:30–22:00"):
 * a translated text that is the whole line, or one end of it next to " · ".
 */
function trPart(locale: string, entity: string, column: string, line: string): string {
  const map = BY_LOCALE.get(locale);
  if (!map) return line;
  const prefix = `${entity}\u0000${column}\u0000`;
  for (const [k, text] of map) {
    if (!k.startsWith(prefix)) continue;
    const english = k.slice(prefix.length);
    if (line === english) return text;
    if (line.startsWith(`${english} · `)) return `${text}${line.slice(english.length)}`;
    if (line.endsWith(` · ${english}`)) return `${line.slice(0, -english.length)}${text}`;
  }
  return line;
}

const media = <M extends Media | null>(locale: string, m: M): M => (m && m.alt ? { ...m, alt: tr(locale, 'media', 'alt', m.alt) } : m);

export const packFallback = {
  cuisines: (locale: string, list: Cuisine[]): Cuisine[] =>
    list.map((c) => ({ ...c, label: tr(locale, 'cuisines', 'label', c.label), image: media(locale, c.image) })),
  destinations: (locale: string, list: Destination[]): Destination[] =>
    list.map((d) => ({
      ...d,
      name: tr(locale, 'destinations', 'name', d.name),
      cardTitle: [tr(locale, 'destinations', 'card_title_1', d.cardTitle[0]), tr(locale, 'destinations', 'card_title_2', d.cardTitle[1])],
      cardBlurb: [tr(locale, 'destinations', 'card_blurb_1', d.cardBlurb[0]), tr(locale, 'destinations', 'card_blurb_2', d.cardBlurb[1])],
      address: tr(locale, 'destinations', 'address', d.address),
      image: media(locale, d.image),
    })),
  nav: (locale: string, list: NavItem[]): NavItem[] => list.map((n) => ({ ...n, label: tr(locale, 'nav_items', 'label', n.label) })),
  experiences: (locale: string, list: Experience[]): Experience[] =>
    list.map((e) => ({ ...e, title: tr(locale, 'experiences', 'title', e.title), blurb: tr(locale, 'experiences', 'blurb', e.blurb) })),
  stories: (locale: string, list: Story[]): Story[] =>
    list.map((s) => ({
      ...s,
      title: tr(locale, 'stories', 'title', s.title),
      kicker: trPart(locale, 'stories', 'category', s.kicker),
      image: media(locale, s.image),
    })),
  offers: (locale: string, list: Offer[]): Offer[] =>
    list.map((o) => ({
      ...o,
      title: tr(locale, 'offers', 'title', o.title),
      venue: tr(locale, 'offers', 'venue_override', o.venue),
      detail: trPart(locale, 'offers', 'schedule', o.detail),
    })),
  restaurants: (locale: string, list: Restaurant[]): Restaurant[] =>
    list.map((r) => ({ ...r, type: tr(locale, 'restaurants', 'type_label', r.type), image: media(locale, r.image) })),
  media,
  heroSlides: (locale: string, list: HeroSlide[]): HeroSlide[] => list.map((h) => ({ ...h, image: media(locale, h.image), mobile: media(locale, h.mobile) })),
  sections: (locale: string, sections: Sections): Sections =>
    Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, { ...v, image: media(locale, v.image) }])) as Sections,
  detail: (locale: string, d: RestaurantDetail | null): RestaurantDetail | null =>
    d && {
      ...d,
      kicker: tr(locale, 'restaurants', 'detail_kicker', d.kicker),
      storyLabel: tr(locale, 'restaurants', 'story_label', d.storyLabel),
      story: tr(locale, 'restaurants', 'story', d.story),
      highlightsTitle: tr(locale, 'restaurants', 'highlights_title', d.highlightsTitle),
      destinationName: tr(locale, 'destinations', 'name', d.destinationName),
      portrait: media(locale, d.portrait),
      highlights: d.highlights.map(
        (h): Highlight => ({
          ...h,
          title: tr(locale, 'restaurant_highlights', 'title', h.title),
          detail: tr(locale, 'restaurant_highlights', 'detail', h.detail),
          image: media(locale, h.image),
        }),
      ),
      seo: {
        title: tr(locale, 'restaurants', 'seo_title', d.seo.title),
        description: tr(locale, 'restaurants', 'seo_description', d.seo.description),
        image: media(locale, d.seo.image),
      },
    },
};
