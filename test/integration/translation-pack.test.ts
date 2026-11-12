import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sourceHash } from '@/lib/i18n/source-hash';
import type { AuditActor } from '@/lib/server/audit';
import { SHIPPED_TRANSLATION_PACKS } from '@/lib/server/content-admin/shipped-translation-packs';
import { applyTranslationPack, translationPackErrors, translationPackTables, type TranslationItem, type TranslationPack } from '@/lib/server/content-admin/translation-pack';
import { databaseUrl, resetDatabase, TEST_DATABASE_URL } from '../helpers/db';

/*
 * applyTranslationPack (lib/server/content-admin/translation-pack.ts) on a
 * freshly migrated database of its own: an item applies only while its English
 * reads as the pack says and it has no row in the pack's language, as a
 * reviewed row (origin 'ai') stamped with the English row's source_hash; its
 * History gets one row (a highlight's under its restaurant); a file is named
 * by its pathname; a dry run changes nothing. And the shipped pack is valid.
 */

const run = promisify(execFile);
const ACTOR: AuditActor = { id: 'script:apply-translation-pack', email: 'script:apply-translation-pack' };

let url: string;
let pool: Pool;

const pack = (...items: TranslationItem[]): TranslationPack => ({ locale: 'vi', items });
const apply = (p: TranslationPack, dryRun = false) => applyTranslationPack(pool, ACTOR, p, { dryRun });
const english = async (table: string, fk: string, id: string) =>
  (await pool.query<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${fk}::text = $1 AND locale = 'en'`, [id])).rows[0];
const row = async (table: string, fk: string, id: string, locale = 'vi') =>
  (await pool.query<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${fk}::text = $1 AND locale = $2`, [id, locale])).rows[0];
const audits = async (entityType: string, entityId: string) =>
  (await pool.query<{ actor_id: string; before: unknown; after: unknown }>('SELECT actor_id, before, after FROM audit_log WHERE entity_type = $1 AND entity_id = $2 ORDER BY id', [entityType, entityId])).rows;

describe('translationPackErrors', () => {
  it('accepts the shipped Vietnamese pack', () => {
    expect(translationPackErrors(JSON.parse(readFileSync('db/translation-packs/2026-11-vietnamese.json', 'utf8')))).toEqual([]);
  });

  it('every pack the admin can apply is valid, and is a file of db/translation-packs', () => {
    for (const shipped of SHIPPED_TRANSLATION_PACKS) {
      expect(translationPackErrors(shipped.pack)).toEqual([]);
      expect(shipped.pack).toEqual(JSON.parse(readFileSync(`db/translation-packs/${shipped.id}.json`, 'utf8')));
    }
  });

  it('refuses English as the target, an unknown list, a column that is not a text, a translation of nothing, an id of the wrong type, an item twice', () => {
    expect(translationPackErrors({ locale: 'en', items: [] })).toEqual(['en is not a listed language other than en']);
    expect(
      translationPackErrors(
        pack(
          { entity: 'reservations' as never, id: '1', en: { name: 'x' }, vi: { name: 'y' } },
          { entity: 'restaurants', id: 'danaksara', en: { menu_pdf_media_id: 'x' }, vi: { menu_pdf_media_id: 'y' } },
          { entity: 'stories', id: '1', en: { title: 'A' }, vi: { category: 'B' } },
          { entity: 'stories', id: 'one', en: { title: 'A' }, vi: { title: 'B' } },
          { entity: 'cuisines', id: 'thai', en: { label: 'Thai' }, vi: { label: 'Thái' } },
          { entity: 'cuisines', id: 'thai', en: { label: 'Thai' }, vi: { label: 'Thái' } },
        ),
      ),
    ).toEqual([
      'item 1 (reservations 1): unknown list',
      'item 2 (restaurants danaksara): en.menu_pdf_media_id is not a text of this list (type_label, detail_kicker, story_label, story, highlights_title, seo_title, seo_description)',
      'item 2 (restaurants danaksara): vi.menu_pdf_media_id is not a text of this list',
      'item 3 (stories 1): vi.category translates no English',
      'item 4 (stories one): the id must be text of digits',
      'item 6 (cuisines thai): listed twice',
    ]);
  });
});

describe.skipIf(!TEST_DATABASE_URL)('translation packs (own database)', () => {
  beforeAll(async () => {
    url = databaseUrl('furama_cuisine_translationpack_test');
    resetDatabase(url);
    pool = new Pool({ connectionString: url, max: 4 });
  });
  afterAll(async () => {
    await pool?.end();
  });

  it('writes a reviewed row against the English it read, with one History row for the item', async () => {
    const en = await english('cuisine_i18n', 'cuisine_id', 'thai');
    const [outcome] = await apply(pack({ entity: 'cuisines', id: 'thai', en: { label: String(en.label) }, vi: { label: 'Thái Lan' } }));
    expect(outcome.applied).toBe(true);
    expect(await row('cuisine_i18n', 'cuisine_id', 'thai')).toMatchObject({
      label: 'Thái Lan',
      status: 'reviewed',
      origin: 'ai',
      source_hash: sourceHash(['label'], en),
      reviewed_by: ACTOR.id,
    });
    const [audit] = await audits('cuisines', 'thai');
    expect(audit.actor_id).toBe(ACTOR.id);
    expect(JSON.stringify(audit.before)).not.toContain('Thái Lan');
    expect(JSON.stringify(audit.after)).toContain('Thái Lan');
  });

  it('skips an item that has a row in the language already, or whose English staff changed since', async () => {
    const it1 = await english('cuisine_i18n', 'cuisine_id', 'italian');
    await pool.query(`UPDATE cuisine_i18n SET label = 'Italian & Pizza' WHERE cuisine_id = 'italian' AND locale = 'en'`);
    const outcomes = await apply(
      pack(
        { entity: 'cuisines', id: 'thai', en: { label: 'Thai' }, vi: { label: 'Ẩm thực Thái' } },
        { entity: 'cuisines', id: 'italian', en: { label: String(it1.label) }, vi: { label: 'Ý' } },
        { entity: 'cuisines', id: 'nowhere', en: { label: 'X' }, vi: { label: 'Y' } },
      ),
    );
    expect(outcomes.map((o) => o.reason)).toEqual(['it has a vi row already', 'its English is no longer the pack\'s (label: Italian & Pizza)', 'not found']);
    expect((await row('cuisine_i18n', 'cuisine_id', 'thai')).label).toBe('Thái Lan');
    expect(await row('cuisine_i18n', 'cuisine_id', 'italian')).toBeUndefined();
  });

  it('files a highlight under its restaurant, and names a file by its pathname', async () => {
    const { rows } = await pool.query<{ id: string; restaurant_id: string }>('SELECT id::text, restaurant_id FROM restaurant_highlights ORDER BY id LIMIT 1');
    const [hl] = rows;
    const hlEn = await english('restaurant_highlight_i18n', 'highlight_id', hl.id);
    const { rows: files } = await pool.query<{ id: string; pathname: string }>(
      `SELECT m.id::text, m.pathname FROM media m JOIN media_i18n mi ON mi.media_id = m.id AND mi.locale = 'en' WHERE mi.alt IS NOT NULL ORDER BY m.pathname LIMIT 1`,
    );
    const [file] = files;
    const fileEn = await english('media_i18n', 'media_id', file.id);
    const outcomes = await apply(
      pack(
        { entity: 'restaurant_highlights', id: hl.id, en: { title: String(hlEn.title), detail: String(hlEn.detail) }, vi: { title: 'Điểm nổi bật' } },
        { entity: 'media', id: file.pathname, en: { alt: String(fileEn.alt) }, vi: { alt: 'Ảnh' } },
      ),
    );
    expect(outcomes.every((o) => o.applied)).toBe(true);
    expect((await row('restaurant_highlight_i18n', 'highlight_id', hl.id)).title).toBe('Điểm nổi bật');
    expect((await row('media_i18n', 'media_id', file.id)).alt).toBe('Ảnh');
    expect(await audits('restaurants', hl.restaurant_id)).toHaveLength(1);
    expect(await audits('media', file.id)).toHaveLength(1);
    // What the admin's "Áp dụng" expires: the highlights' tables and the library's.
    expect(translationPackTables(outcomes)).toEqual(expect.arrayContaining(['restaurant_highlight_i18n', 'media_i18n']));
  });

  it('a dry run reports what it would do and changes nothing; the script runs it so', async () => {
    const en = await english('cuisine_i18n', 'cuisine_id', 'japanese');
    const p = pack({ entity: 'cuisines', id: 'japanese', en: { label: String(en.label) }, vi: { label: 'Nhật Bản' } });
    expect((await apply(p, true))[0].applied).toBe(true);
    expect(await row('cuisine_i18n', 'cuisine_id', 'japanese')).toBeUndefined();
    const { stdout } = await run(process.execPath, ['scripts/apply-translation-pack.mjs', 'db/translation-packs/2026-11-vietnamese.json'], {
      env: { ...process.env, DATABASE_URL_UNPOOLED: url },
    });
    expect(stdout).toContain('DRY RUN');
    expect(stdout).toMatch(/applied cuisines japanese/);
    expect(stdout).toContain('Dry run: nothing changed.');
    expect(await row('cuisine_i18n', 'cuisine_id', 'japanese')).toBeUndefined();
  });
});
