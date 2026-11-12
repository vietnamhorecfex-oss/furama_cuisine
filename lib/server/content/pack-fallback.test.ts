import { describe, expect, it } from 'vitest';
import type { Cuisine, Offer, Story } from '@/lib/content/types';
import { packFallback } from './pack-fallback';

/* The shipped packs as the guest pages' fallback: only a field still showing the English a pack translated changes. */

const cuisine = (label: string): Cuisine => ({ id: 'thai', label, image: { url: '/assets/chef.jpg', alt: 'A Furama chef at work', width: 1, height: 1 } });

describe('packFallback', () => {
  it('shows the pack’s Vietnamese where /vi still shows the English it translated', () => {
    expect(packFallback.cuisines('vi', [cuisine('Thai')])).toEqual([
      { id: 'thai', label: 'Thái Lan', image: { url: '/assets/chef.jpg', alt: 'Đầu bếp Furama đang làm việc', width: 1, height: 1 } },
    ]);
    expect(packFallback.nav('vi', [{ target: 'restaurants', label: 'Restaurants' }])).toEqual([{ target: 'restaurants', label: 'Nhà hàng' }]);
  });

  it('leaves English, a translation staff saved, and English staff edited as they are', () => {
    expect(packFallback.cuisines('en', [cuisine('Thai')])[0].label).toBe('Thai');
    expect(packFallback.cuisines('vi', [cuisine('Ẩm thực Thái')])[0].label).toBe('Ẩm thực Thái');
    expect(packFallback.cuisines('vi', [cuisine('Thai & Lao')])[0].label).toBe('Thai & Lao');
    // A name is never a translatable text: a restaurant called like a cuisine keeps its name.
    expect(packFallback.restaurants('vi', [{ type: 'Thai · 2F', name: 'Thai' } as never])[0]).toMatchObject({ type: 'Thái Lan · Tầng 2', name: 'Thai' });
  });

  it('translates the category or the schedule inside a composed line', () => {
    const story: Story = { id: 1, image: null, kicker: 'Restaurant News · 9 Sep 2026', title: 'Grand opening: one house, four flavours in An Thượng', href: '#' };
    expect(packFallback.stories('vi', [story])[0]).toMatchObject({ kicker: 'Tin nhà hàng · 9 Sep 2026', title: 'Khai trương: một ngôi nhà, bốn hương vị tại An Thượng' });
    const offer: Offer = { id: 2, restaurantId: 'taya-house', venue: 'Tàya House', title: 'Vietnamese Cooking Class', detail: 'VND 799,000++ per guest · Daily 11:00 or 14:00 · for 2–7 guests' };
    expect(packFallback.offers('vi', [offer])[0]).toMatchObject({
      title: 'Lớp học nấu ăn Việt Nam',
      venue: 'Tàya House',
      detail: 'VND 799,000++ per guest · Hằng ngày 11:00 hoặc 14:00 · cho 2–7 khách',
    });
  });
});
