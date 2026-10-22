import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Vercel runs only the crons vercel.json lists, and no other gate reads the
 * file: a lost or mistyped entry would pass them all. The outbox drains once
 * a day at 01:00 UTC, 08:00 in Da Nang: the project is on Vercel Hobby, which
 * runs a cron at most once a day and refuses the deploy otherwise, and Neon
 * is on Free, which a 5-minute cron would keep awake past its monthly compute
 * allowance (owner, 2026-10-05). after() still sends each email as soon as
 * its booking commits; the cron only retries what failed. The daily
 * cron runs at 17:05 UTC, 00:05 in Da Nang, so the day's offers, and with
 * them the Offers nav item, change at the venue's midnight instead of at the
 * next hourly revalidation. The media sweep (phase 7, spec §12) runs once a
 * day at 18:35 UTC, 01:35 in Da Nang: one more wake-up of the database a day.
 */

type Cron = { path: string; schedule: string };

const crons = (): Cron[] => JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')).crons;

describe('the crons in vercel.json', () => {
  it('drain the outbox at 08:00 in Da Nang (01:00 UTC), run the daily cron at 00:05 in Da Nang (17:05 UTC) and sweep media at 01:35 (18:35 UTC)', () => {
    expect(crons()).toEqual([
      { path: '/api/cron/outbox', schedule: '0 1 * * *' },
      { path: '/api/cron/daily', schedule: '5 17 * * *' },
      { path: '/api/cron/media-sweep', schedule: '35 18 * * *' },
    ]);
  });

  it('each call a route that exists', () => {
    const missing = crons().filter(({ path }) => !existsSync(join(process.cwd(), 'app', ...path.split('/').filter(Boolean), 'route.ts')));
    expect(missing).toEqual([]);
  });
});
