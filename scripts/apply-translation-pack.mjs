#!/usr/bin/env node
/**
 * Applies a translation pack (README "Translation packs"): reviewed
 * translations of the admin-edited content into one language, through
 * applyTranslationPack (lib/server/content-admin/translation-pack.ts).
 *
 *   DATABASE_URL_UNPOOLED=… node scripts/apply-translation-pack.mjs db/translation-packs/<pack>.json            # dry run
 *   DATABASE_URL_UNPOOLED=… node scripts/apply-translation-pack.mjs db/translation-packs/<pack>.json --apply
 *
 * - Dry run unless --apply: the whole pack runs in a transaction that is
 *   rolled back, so it prints exactly what --apply would do.
 * - An item applies only while its English reads as the pack says and it has
 *   no row in the pack's language: staff edits are skipped and printed, never
 *   overwritten. Safe to run again: what it applied now has a row.
 * - One transaction, one audit_log row per item (actor: this script).
 * - Loads the TypeScript module with jiti, as scripts/apply-content-pack.mjs
 *   does; reads DATABASE_URL_UNPOOLED before DATABASE_URL, never .env files.
 * - It cannot expire the guest pages' cache: redeploy afterwards.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import { Pool } from 'pg';

const root = fileURLToPath(new URL('..', import.meta.url));
const ACTOR = { id: 'script:apply-translation-pack', email: 'script:apply-translation-pack' };
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function fail(message) {
  console.error(`apply-translation-pack: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const unknown = args.filter((a) => a.startsWith('--') && a !== '--apply');
const files = args.filter((a) => !a.startsWith('--'));
if (unknown.length > 0 || files.length !== 1) fail('usage: node scripts/apply-translation-pack.mjs <pack.json> [--apply]');

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) fail('DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set.');
const dbUrl = new URL(connectionString);
if (!LOCAL_HOSTS.has(dbUrl.hostname)) dbUrl.searchParams.set('sslmode', 'verify-full');

console.log(`${apply ? 'APPLY' : 'DRY RUN'}: database ${dbUrl.hostname}${dbUrl.pathname}`);

let pack;
try {
  pack = JSON.parse(await readFile(files[0], 'utf8'));
} catch (err) {
  fail(`${files[0]}: ${err instanceof Error ? err.message : String(err)}`);
}

const jiti = createJiti(import.meta.url, {
  alias: { '@/': root, 'server-only': fileURLToPath(new URL('./server-only-stub.mjs', import.meta.url)) },
});
const { applyTranslationPack, translationPackErrors } = await jiti.import('../lib/server/content-admin/translation-pack.ts');

const errors = translationPackErrors(pack);
if (errors.length > 0) fail(`${files[0]} is not a valid pack:\n${errors.map((e) => `  ${e}`).join('\n')}`);
console.log(`Pack ${files[0]}: ${pack.items.length} item(s) into ${pack.locale}.`);

const pool = new Pool({ connectionString: dbUrl.toString(), max: 1 });
let outcomes;
try {
  outcomes = await applyTranslationPack(pool, ACTOR, pack, { dryRun: !apply });
} catch (err) {
  await pool.end();
  fail(`nothing changed: ${err instanceof Error ? err.message : String(err)}`);
}
await pool.end();

for (const o of outcomes) {
  console.log(`  ${o.applied ? 'applied' : 'skipped'} ${o.item.entity} ${o.item.id}${o.applied ? '' : ` (${o.reason})`}`);
}
const applied = outcomes.filter((o) => o.applied).length;
console.log(`${applied} applied, ${outcomes.length - applied} skipped.`);
if (!apply) {
  console.log('Dry run: nothing changed. Add --apply to write the translations.');
} else if (applied > 0) {
  console.log('Written in one transaction, with one audit row per item. Redeploy so cached guest pages pick up the translations.');
}
