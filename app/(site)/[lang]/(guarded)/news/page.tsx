import type { Metadata } from 'next';
import { lang } from 'next/root-params';
import { NewsGrid } from '@/components/news/NewsGrid';
import { ViewMarker } from '@/components/site/ViewMarker';
import { languageAlternates, ownPageMetadata, pageTitle } from '@/lib/content/seo';
import { getStories } from '@/lib/server/content/home';
import { getEnabledLocales, requireEnabledLocale } from '@/lib/server/content/locales';
import { getShareImage } from '@/lib/server/content/seo';
import { getStrings } from '@/lib/server/content/strings';

/*
 * The News page (owner's audit, 2026-11-21: "chưa có trang News"): every
 * published story of the home page's Stories section on a page of its own, in
 * the order staff set on the stories screen, each card linking to its article.
 * The same cached list as the home page (getStories, tagged content:stories),
 * so a story staff add shows here without a deploy. Its words are stories.*
 * keys, edited on that same screen.
 */

const KEYS = ['stories.news_title', 'stories.news_lede', 'stories.news_empty', 'seo.page_title'] as const;

export async function generateMetadata(): Promise<Metadata> {
  // The language first, as the page does: no read for a language that is off, or for a segment like favicon.ico.
  const locale = await requireEnabledLocale(await lang());
  const [t, share, enabled] = await Promise.all([getStrings(locale, KEYS), getShareImage(locale), getEnabledLocales()]);
  const own = ownPageMetadata(pageTitle(t, t['stories.news_title'], locale), t['stories.news_lede'], share);
  // Draft Mode's preview of a language that is off: never indexed, and in no one's hreflang.
  return enabled.some((l) => l.code === locale)
    ? { ...own, alternates: languageAlternates(locale, '/news', enabled) }
    : { ...own, robots: { index: false, follow: false }, alternates: null };
}

export default async function NewsPage() {
  const locale = await requireEnabledLocale(await lang());
  const [stories, t] = await Promise.all([getStories(locale), getStrings(locale, KEYS)]);

  return (
    <ViewMarker view="other">
      <section className="shell news">
        <h1 className="news-title">{t['stories.news_title']}</h1>
        <p className="news-lede">{t['stories.news_lede']}</p>
        {stories.length > 0 ? <NewsGrid items={stories} /> : <p className="news-empty">{t['stories.news_empty']}</p>}
      </section>
    </ViewMarker>
  );
}
