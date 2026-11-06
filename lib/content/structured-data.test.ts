import { describe, expect, it } from 'vitest';
import { jsonLd, restaurantSchema } from './structured-data';

const base = {
  name: 'Tàya House',
  url: 'https://dining.example/en/restaurants/taya-house',
  origin: new URL('https://dining.example'),
  lang: 'en',
  image: null,
  phone: null,
  map: null,
  address: null,
  cuisines: [],
  bookingEnabled: true,
};

describe('restaurantSchema', () => {
  it('names the restaurant and its page, and leaves out what it does not know', () => {
    expect(restaurantSchema(base)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'Tàya House',
      url: 'https://dining.example/en/restaurants/taya-house',
      inLanguage: 'en',
      acceptsReservations: true,
    });
  });

  it('adds the picture on the site origin, the phone, the map, the address and the cuisines', () => {
    const schema = restaurantSchema({
      ...base,
      image: { url: '/assets/taya.jpg', alt: '', width: 10, height: 10 },
      phone: { tel: '+842366519999', display: '0236 651 9999' },
      map: 'https://maps.example/taya',
      address: '103–105 Võ Nguyên Giáp, Đà Nẵng',
      cuisines: ['Vietnamese'],
    });
    expect(schema).toMatchObject({
      image: 'https://dining.example/assets/taya.jpg',
      telephone: '+842366519999',
      hasMap: 'https://maps.example/taya',
      address: { '@type': 'PostalAddress', streetAddress: '103–105 Võ Nguyên Giáp, Đà Nẵng', addressCountry: 'VN' },
      servesCuisine: ['Vietnamese'],
    });
  });

  it('keeps an absolute picture (Vercel Blob) as it is', () => {
    const image = { url: 'https://store.public.blob.vercel-storage.com/a.jpg', alt: '', width: 1, height: 1 };
    expect(restaurantSchema({ ...base, image }).image).toBe(image.url);
  });
});

describe('jsonLd', () => {
  it('escapes "<" so a value cannot close the script element', () => {
    expect(jsonLd({ name: '</script><b>' })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
