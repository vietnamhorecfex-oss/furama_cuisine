'use client';

import type { Story } from '@/lib/content/types';
import { StoryCard } from '@/components/home/Stories';

/** The News page's stories (app/(site)/[lang]/(guarded)/news): the home page's cards, in a grid instead of a rail. */
export function NewsGrid({ items }: { items: Story[] }) {
  return (
    <div className="news-grid">
      {items.map((s) => (
        <StoryCard key={s.id} image={s.image} kicker={s.kicker} title={s.title} href={s.href} reveal={false} />
      ))}
    </div>
  );
}
