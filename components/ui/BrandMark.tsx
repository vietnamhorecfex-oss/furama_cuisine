import { BRAND_MARK_SIZE, BRAND_MARK_SRC } from '@/lib/brand-mark';

/** The mark (lib/brand-mark.ts), sized by its class (styles/layout.css). Decorative: the link around it carries the name. */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small static file in public/, no optimiser needed
    <img
      className={className ? `brand-mark ${className}` : 'brand-mark'}
      src={BRAND_MARK_SRC}
      width={BRAND_MARK_SIZE}
      height={BRAND_MARK_SIZE}
      alt=""
      decoding="async"
    />
  );
}
