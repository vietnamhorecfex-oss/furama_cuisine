import 'server-only';
import type { Pool, PoolClient } from 'pg';
import type { ContentTable } from '@/lib/cache-plan';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { LISTED_LOCALE_CODES } from '@/lib/i18n/site-locales';
import { sourceHash } from '@/lib/i18n/source-hash';
import { insertAudit, withTransaction, type AuditActor } from '@/lib/server/audit';
import { lockList, readItem, type ItemDef } from '@/lib/server/history/snapshot';
import { MEDIA } from '@/lib/server/media/library';
import { CUISINE } from './cuisines';
import { DESTINATION } from './destinations';
import { EXPERIENCE } from './experiences';
import { NAV_ITEM } from './nav';
import { OFFER } from './offers';
import { HIGHLIGHT, readRestaurant, RESTAURANT } from './restaurants';
import { STORY } from './stories';

/*
 * A translation pack (db/translation-packs/*.json, README "Translation packs"):
 * reviewed translations of the content staff edit in the admin, into one
 * language, applied in one transaction as if an editor had saved each item's
 * language tab, with one audit_log row per item (its History can take the
 * translation away again). Run by scripts/apply-translation-pack.mjs, or from
 * /admin/translations for a pack shipped with the code (shipped-translation-packs.ts).
 *
 * Each item names the English it translates, every text of the item's English
 * row. It applies only while that row still reads exactly so and the item has
 * no row in the pack's language yet: a staff edit, of the English or of an
 * earlier translation, is never overwritten. The row is reviewed (guests see
 * it) with origin 'ai' (written by a machine, reviewed by the owner before the
 * pack shipped), stamped with the English row's source_hash, so an English
 * edit later shows "EN đã đổi" as for any translation.
 *
 * Media rows are named by their pathname (their ids differ between databases),
 * which matches the seeded file or its copy moved to Blob.
 */

export const TRANSLATION_ENTITIES = [
  'restaurants',
  'restaurant_highlights',
  'destinations',
  'cuisines',
  'experiences',
  'stories',
  'offers',
  'nav_items',
  'media',
] as const;
export type TranslationEntity = (typeof TRANSLATION_ENTITIES)[number];

export type TranslationItem = { entity: TranslationEntity; id: string; en: Record<string, string> } & Record<string, unknown>;
export type TranslationPack = { locale: string; note?: string; items: TranslationItem[] };
export type TranslationOutcome = { item: TranslationItem; applied: boolean; reason?: string };

type Audited = { entityType: string; entityId: string; read: () => Promise<object | null> };
type Target = {
  def: ItemDef;
  /** The advisory lock its editor takes, if it takes one. */
  listKey?: string;
  /** The item's id in this database (a media pathname resolves to its id), its row locked as its editor locks it; null when it is gone. */
  lock: (db: PoolClient, id: string) => Promise<{ id: string; audited: Audited } | null>;
};

/** The texts of a translation: its columns that are words, not a menu file's id or a link. */
const textColumns = (def: ItemDef) => def.i18n!.columns.filter((c) => !/(_id|_url|href)$/.test(c));

async function lockRow(db: PoolClient, table: string, idType: string, id: string): Promise<boolean> {
  return (await db.query(`SELECT 1 FROM ${table} WHERE id = $1::${idType} FOR UPDATE`, [id])).rowCount === 1;
}

const listed = (def: ItemDef, listKey: string = def.entityType): Target => ({
  def,
  listKey,
  lock: async (db, id) => ((await lockRow(db, def.table, def.idType, id)) ? { id, audited: { entityType: def.entityType, entityId: id, read: () => readItem(db, def, id) } } : null),
});

const TARGETS: Record<TranslationEntity, Target> = {
  restaurants: {
    def: RESTAURANT,
    listKey: 'restaurants',
    lock: async (db, id) =>
      (await lockRow(db, 'restaurants', RESTAURANT.idType, id)) ? { id, audited: { entityType: RESTAURANT.entityType, entityId: id, read: () => readRestaurant(db, id) } } : null,
  },
  // A highlight is part of its restaurant: its restaurant's row first, as the restaurant screen locks it, and its History.
  restaurant_highlights: {
    def: HIGHLIGHT,
    listKey: 'restaurants',
    lock: async (db, id) => {
      const { rows } = await db.query<{ owner: string }>('SELECT restaurant_id AS owner FROM restaurant_highlights WHERE id = $1::bigint', [id]);
      const owner = rows[0]?.owner;
      if (!owner || !(await lockRow(db, 'restaurants', RESTAURANT.idType, owner))) return null;
      const { rowCount } = await db.query('SELECT 1 FROM restaurant_highlights WHERE id = $1::bigint AND restaurant_id = $2 FOR UPDATE', [id, owner]);
      return rowCount === 1 ? { id, audited: { entityType: RESTAURANT.entityType, entityId: owner, read: () => readRestaurant(db, owner) } } : null;
    },
  },
  destinations: listed(DESTINATION),
  cuisines: listed(CUISINE),
  experiences: listed(EXPERIENCE),
  stories: listed(STORY),
  offers: listed(OFFER),
  nav_items: listed(NAV_ITEM, 'nav_items'),
  // The library locks the file's row (FOR UPDATE), no list. "/assets/x.jpg", or its copy in Blob ("production/assets/x.jpg").
  media: {
    def: MEDIA,
    lock: async (db, pathname) => {
      const { rows } = await db.query<{ id: string; pathname: string }>(
        `SELECT id::text, pathname FROM media
          WHERE (pathname = $1 OR right(pathname, length($1)) = $1) AND deleted_at IS NULL ORDER BY pathname FOR UPDATE`,
        [pathname],
      );
      const file = rows.find((r) => r.pathname === pathname) ?? rows.find((r) => pathname.startsWith('/assets/') && /^[a-z]+$/.test(r.pathname.slice(0, -pathname.length)));
      return file ? { id: file.id, audited: { entityType: MEDIA.entityType, entityId: file.id, read: () => readItem(db, MEDIA, file.id) } } : null;
    },
  },
};

/** The tables the applied items touched: what a save of them expires (tagsForSave). */
export function translationPackTables(outcomes: readonly TranslationOutcome[]): ContentTable[] {
  return [...new Set(outcomes.filter((o) => o.applied).flatMap((o) => TARGETS[o.item.entity].def.tables))];
}

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/** Checks a pack's shape before anything is read: a listed language, known lists, ids of their type, only translatable texts. */
export function translationPackErrors(pack: TranslationPack): string[] {
  if (!pack || typeof pack.locale !== 'string' || !Array.isArray(pack.items)) return ['a pack needs a locale and a list of items'];
  if (pack.locale === DEFAULT_LOCALE || !LISTED_LOCALE_CODES.includes(pack.locale)) return [`${pack.locale} is not a listed language other than ${DEFAULT_LOCALE}`];
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [i, item] of pack.items.entries()) {
    const at = `item ${i + 1} (${item?.entity} ${item?.id})`;
    if (!(TRANSLATION_ENTITIES as readonly string[]).includes(item?.entity)) {
      errors.push(`${at}: unknown list`);
      continue;
    }
    const def = TARGETS[item.entity].def;
    if (typeof item.id !== 'string' || !(def.idType === 'bigint' ? /^\d{1,18}$/ : /\S/).test(item.id)) errors.push(`${at}: the id must be text${def.idType === 'bigint' ? ' of digits' : ''}`);
    if (seen.has(`${item.entity}:${item.id}`)) errors.push(`${at}: listed twice`);
    seen.add(`${item.entity}:${item.id}`);
    const columns = textColumns(def);
    const en = item.en;
    const to = item[pack.locale] as Record<string, unknown> | undefined;
    if (!en || typeof en !== 'object' || Object.keys(en).length === 0) errors.push(`${at}: en names the English it translates`);
    if (!to || typeof to !== 'object' || Object.keys(to).length === 0) errors.push(`${at}: ${pack.locale} holds the translation`);
    if (!en || !to) continue;
    for (const [c, v] of Object.entries(en)) if (!columns.includes(c) || !isText(v)) errors.push(`${at}: en.${c} is not a text of this list (${columns.join(', ')})`);
    for (const [c, v] of Object.entries(to)) {
      if (!columns.includes(c) || !isText(v)) errors.push(`${at}: ${pack.locale}.${c} is not a text of this list`);
      else if (!isText(en[c])) errors.push(`${at}: ${pack.locale}.${c} translates no English`);
    }
  }
  return errors;
}

/** One item's translation, if its English still reads as the pack says and it has none yet; otherwise why not. The item is locked. */
async function applyItem(client: PoolClient, item: TranslationItem, id: string, locale: string, actor: AuditActor): Promise<string | null> {
  const def = TARGETS[item.entity].def;
  const i18n = def.i18n!;
  const cast = `::${def.idType}`;
  const { rows } = await client.query<Record<string, unknown> & { locale: string }>(
    `SELECT * FROM ${i18n.table} WHERE ${i18n.fk} = $1${cast} AND locale = ANY($2::text[]) FOR UPDATE`,
    [id, [DEFAULT_LOCALE, locale]],
  );
  const english = rows.find((r) => r.locale === DEFAULT_LOCALE);
  if (!english) return 'no English row';
  if (rows.some((r) => r.locale === locale)) return `it has a ${locale} row already`;
  const changed = textColumns(def).filter((c) => (english[c] ?? null) !== (item.en[c] ?? null));
  if (changed.length) return `its English is no longer the pack's (${changed.map((c) => `${c}: ${english[c] ?? 'empty'}`).join('; ')})`;

  const values = item[locale] as Record<string, string>;
  const columns = Object.keys(values);
  await client.query(
    `INSERT INTO ${i18n.table} (${i18n.fk}, locale, ${columns.join(', ')}, status, origin, ai_model, source_hash, reviewed_by, reviewed_at, updated_at, updated_by)
     VALUES ($1${cast}, $2, ${columns.map((_, i) => `$${i + 5}`).join(', ')}, 'reviewed', 'ai', NULL, $3, $4, now(), now(), $4)`,
    [id, locale, sourceHash(i18n.columns, english), actor.id, ...columns.map((c) => values[c])],
  );
  return null;
}

/**
 * Applies a pack in one transaction, or (dryRun) runs it and rolls back, so a
 * dry run reports exactly what an apply would do. One audit row per item it
 * changed (a highlight's under its restaurant), before and after as that
 * item's History reads it.
 */
export async function applyTranslationPack(pool: Pool, actor: AuditActor, pack: TranslationPack, options: { dryRun: boolean }): Promise<TranslationOutcome[]> {
  const errors = translationPackErrors(pack);
  if (errors.length) throw new Error(`translation pack: ${errors.join('; ')}`);

  const run = async (client: PoolClient) => {
    // The lists' advisory locks first, in one order, as their editors take them.
    const keys = [...new Set(pack.items.flatMap((i) => TARGETS[i.entity].listKey ?? []))].sort();
    for (const key of keys) await lockList(client, key);
    const outcomes: TranslationOutcome[] = [];
    const audited = new Map<string, Audited & { before: object | null; changed: boolean }>();
    for (const item of pack.items) {
      const found = await TARGETS[item.entity].lock(client, item.id);
      if (!found) {
        outcomes.push({ item, applied: false, reason: 'not found' });
        continue;
      }
      const k = `${found.audited.entityType}:${found.audited.entityId}`;
      if (!audited.has(k)) audited.set(k, { ...found.audited, before: await found.audited.read(), changed: false });
      const reason = await applyItem(client, item, found.id, pack.locale, actor);
      outcomes.push(reason ? { item, applied: false, reason } : { item, applied: true });
      if (!reason) audited.get(k)!.changed = true;
    }
    for (const a of audited.values()) {
      if (a.changed) await insertAudit(client, actor, { action: 'update', entityType: a.entityType, entityId: a.entityId, before: a.before, after: await a.read() });
    }
    return outcomes;
  };

  if (!options.dryRun) return withTransaction(pool, run);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    return await run(client);
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
}
