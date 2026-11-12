import 'server-only';
import vietnamese from '@/db/translation-packs/2026-11-vietnamese.json';
import type { TranslationPack } from './translation-pack';

/*
 * The translation packs shipped with the code, which staff apply from
 * /admin/translations (owner, 2026-11-12: no database address or command line
 * needed). The same files scripts/apply-translation-pack.mjs applies; each
 * applies only what is still as it says, so pressing it twice changes nothing.
 */
export type ShippedTranslationPack = { id: string; label: string; pack: TranslationPack };

export const SHIPPED_TRANSLATION_PACKS: readonly ShippedTranslationPack[] = [
  { id: '2026-11-vietnamese', label: 'Tiếng Việt: nhà hàng, ẩm thực, điểm đến, trải nghiệm, câu chuyện, ưu đãi, menu, alt ảnh (11/2026)', pack: vietnamese as unknown as TranslationPack },
];
