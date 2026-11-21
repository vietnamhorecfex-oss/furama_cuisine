'use client';

import type { Media, Story } from '@/lib/content/types';
import type { Copy } from '@/lib/i18n/registry';
import Link from 'next/link';
import { useSite } from '@/components/site/SiteProvider';
import { CmsImage } from '@/components/ui/CmsImage';
import { newsHref } from '@/lib/i18n/href';
import { SplitWords } from '@/components/ui/SplitWords';
import { useReveal } from '@/lib/motion';

/** The cards (stories) and the section's copy (stories.*) come from the page, read and formatted on the server. */
export function Stories({ items, copy }: { items: Story[]; copy: Copy<'stories'> }) {
  const { locale } = useSite();
  const title = useReveal<HTMLHeadingElement>('title');
  const lede = useReveal<HTMLParagraphElement>('up');

  return (
    <section id="stories" className="stories">
      <div className="shell">
        <div className="stories-head">
          <h2 ref={title} data-reveal="title" className="section-title balance">
            <SplitWords text={copy['stories.title']} />
          </h2>
          <p ref={lede} data-reveal="up" className="section-lede">
            {copy['stories.lede']}
          </p>
          {/* Every story on a page of its own (app/(site)/[lang]/(guarded)/news). */}
          <Link href={newsHref(locale)} className="text-link stories-all">
            {copy['stories.view_all']} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="stories-rail">
          {items.map((s) => (
            <StoryCard key={s.id} image={s.image} kicker={s.kicker} title={s.title} href={s.href} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One story as a card: its picture, its kicker (category · date) and title, linking to the article. */
export function StoryCard({
  image,
  kicker,
  title,
  href,
}: {
  image: Media | null;
  kicker: string;
  title: string;
  href: string;
}) {
  const ref = useReveal<HTMLAnchorElement>('card');

  return (
    <a ref={ref} data-reveal="card" href={href} target="_blank" rel="noopener" className="story">
      <span className="story-frame frame" data-reveal-img="1">
        <span className="story-zoom" data-reveal-zoom="1">
          {/* Decorative by role: the title below says what the story is. */}
          {image && <CmsImage media={image} decorative fill sizes="(max-width: 759px) 72vw, 302px" className="story-img" />}
        </span>
      </span>
      <span className="story-kicker">{kicker}</span>
      <span className="story-title">{title}</span>
    </a>
  );
}
