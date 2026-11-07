/*
 * The privacy policy versions the migrations record (legal_versions). They are
 * history, not test data: a test that cleans the table up keeps them, or the
 * version in force falls back to the seeded first row and no longer matches
 * the registry's agreed text.
 *
 * When a new migration records a version (lib/legal.test.ts says when), add
 * its pair here and point CURRENT_POLICY at it.
 */

/** Migration 009's seed: the phase-5 policy, the first row (PRIVACY_POLICY_VERSION). */
export const SEEDED_POLICY = { version: '2026-10-03', sha256: 'f49aa3f58723d14d6491c1801466c411fe9439acab85b4da5272d4c7676e10d2' } as const;

/** Migration 015: the brand renamed Furama Dining World. */
export const BRAND_RENAME_POLICY = { version: '2026-10-15', sha256: '77926aacc33be47d2aa8dc6c07ed2b9355ff0a3b954177a3628c1064acd0a003' } as const;

/** The newest version a migration recorded: in force for English guests while no editor has saved agreed text. */
export const CURRENT_POLICY = BRAND_RENAME_POLICY;

/** A WHERE clause for the rows a test added (an editor's save, a test's own insert), never a migration's. */
export const NOT_RECORDED = `created_by IS DISTINCT FROM 'seed' AND coalesce(created_by, '') NOT LIKE 'migration %'`;
