'use client';

import Link from 'next/link';
import { privacyHref } from '@/lib/legal';
import { useSite } from '@/components/site/SiteProvider';
import { socialKey } from '@/lib/content/footer';
import { homeHref } from '@/lib/i18n/href';
import { useReveal } from '@/lib/motion';

const WORDMARK = 'FURAMA DINING WORLD';
/** Each half of the band repeats the wordmark this often: wider than a 2560 px screen at the band's largest size. */
const BAND_REPEATS = 4;

export function Footer() {
  const { goHomeTop, locale, site, strings } = useSite();
  const reveal = useReveal<HTMLDivElement>('fade');
  // The destinations staff mark for the footer, each as "name · address · phone" (destinations.show_in_footer; R24: edited on the destinations screen).
  const venues = site.destinations.filter((d) => d.showInFooter);
  const email = site.settings.email;

  return (
    <footer className="footer motif-lattice">
      {/* The key fret of Furama's emblem, as the footer's top edge (styles/ornament.css). */}
      <span className="band-fret" aria-hidden="true" />
      <div ref={reveal} data-reveal="fade" className="footer-top shell">
        <a
          href={homeHref(locale)}
          className="footer-wordmark"
          onClick={(e) => {
            e.preventDefault();
            goHomeTop();
          }}
        >
          {WORDMARK}
        </a>
        <div className="footer-tagline">{strings['footer.tagline']}</div>
        <div className="footer-socials">
          {site.socials.map((s) => (
            <a key={s.platform + s.href} href={s.href} target="_blank" rel="noopener" className="footer-social">
              {strings[socialKey(s.platform)]}
            </a>
          ))}
        </div>
        <div className="footer-member">{strings['footer.member']}</div>
      </div>

      <div className="shell footer-bottom-wrap">
        <div className="footer-bottom">
          {/* Every destination staff mark for the footer, side by side as equals: its name, its address, its phone,
              each on its own line, a blank part left out (L7-7). The admin's contact screen previews them as one line each. */}
          <div className="footer-venues">
            {venues.map((d) => (
              <div key={d.id} className="footer-venue">
                {d.name?.trim() && <span className="footer-venue-name">{d.name}</span>}
                {d.address?.trim() && <span>{d.address}</span>}
                {d.phone && (
                  <a href={`tel:${d.phone.tel}`} className="footer-strong">
                    {d.phone.display}
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="footer-meta">
            <a href={`mailto:${email}`} className="footer-strong">
              {email}
            </a>
            {/* e2e/visual-added.css hides this link, so the pre-phase-5 baselines still compare pixel for pixel. */}
            <Link href={privacyHref(locale)} className="footer-strong footer-legal">
              {strings['legal.link']}
            </Link>
          </div>
        </div>
      </div>

      {/* The wordmark running right to left without end, in outline: decoration (the wordmark above names the brand),
          so hidden from screen readers. Two identical halves slide by one half's width and start over. It pauses under
          the pointer and stands still when motion is reduced (styles/layout.css). */}
      <div className="footer-band" aria-hidden="true">
        <div className="footer-band-track">
          {[0, 1].map((half) => (
            <span key={half} className="footer-band-half">
              {Array.from({ length: BAND_REPEATS }, (_, i) => (
                <span key={i} className="footer-band-item">
                  {WORDMARK}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Clears the fixed mobile tab bar. */}
      <div className="footer-bottom-space" aria-hidden="true" />
    </footer>
  );
}
