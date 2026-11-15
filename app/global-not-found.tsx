import type { Metadata } from 'next';
import { BrandMark } from '@/components/ui/BrandMark';
import { fontVariables } from '@/lib/fonts';
import { homeHref } from '@/lib/i18n/href';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { REGISTRY, type StringDef } from '@/lib/i18n/registry';
import { ENABLED_LOCALE_CODES } from '@/lib/i18n/site-locales';
import './globals.css';

/*
 * URLs that match no route. This page bypasses every layout, so it brings its
 * own document, styles and fonts (not-found.md:51); without the font classes
 * the page falls back to Times. It renders without the database or a request
 * (spec §12), so it cannot tell which language the address was in: it says it
 * in each enabled language that has the words in the registry, the default
 * first, each with the way home in that language (UX/UI audit 2026-11-15,
 * UX-11: under /vi/... it used to speak English alone and lead to /en).
 */

type Said = { code: string; title: string; back: string };

function inRegistry(def: StringDef, code: string): string | undefined {
  return code === DEFAULT_LOCALE ? def.en : code === 'vi' ? def.vi : undefined;
}

const SAID: Said[] = ENABLED_LOCALE_CODES.flatMap((code) => {
  const title = inRegistry(REGISTRY['common.not_found'], code);
  const back = inRegistry(REGISTRY['common.back_home'], code);
  return title && back ? [{ code, title, back }] : [];
}).sort((a, b) => Number(b.code === DEFAULT_LOCALE) - Number(a.code === DEFAULT_LOCALE));

export const metadata: Metadata = {
  title: REGISTRY['seo.not_found_title'].en,
};

export default function GlobalNotFound() {
  const [first, ...others] = SAID;
  return (
    <html lang={DEFAULT_LOCALE} className={fontVariables}>
      <body>
        <main className="shell page-message">
          <a href={homeHref(DEFAULT_LOCALE)} className="page-message-mark">
            <BrandMark />
            <span className="sr-only">Furama Dining World</span>
          </a>
          <h1>
            {first.title}
            {others.map((o) => (
              <span key={o.code} lang={o.code} className="page-message-alt">
                {o.title}
              </span>
            ))}
          </h1>
          {SAID.map((s, i) => (
            <p key={s.code} lang={s.code === DEFAULT_LOCALE ? undefined : s.code} className={i > 0 ? 'page-message-more' : undefined}>
              <a href={homeHref(s.code)} className="page-message-home">
                {s.back}
              </a>
            </p>
          ))}
        </main>
      </body>
    </html>
  );
}
