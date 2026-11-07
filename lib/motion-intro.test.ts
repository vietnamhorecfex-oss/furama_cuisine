import { describe, expect, it } from 'vitest';
import { isHomeLanding } from './motion-intro';

describe('isHomeLanding', () => {
  it('is a language’s home page, with or without the trailing slash', () => {
    for (const path of ['/en', '/vi/', '/zh-hans', '/ko']) expect(isHomeLanding(path), path).toBe(true);
  });

  it('is no other page: a restaurant, the policy, the bare root', () => {
    for (const path of ['/en/restaurants/taya-house', '/vi/privacy', '/', '/en/restaurants/']) expect(isHomeLanding(path), path).toBe(false);
  });
});
