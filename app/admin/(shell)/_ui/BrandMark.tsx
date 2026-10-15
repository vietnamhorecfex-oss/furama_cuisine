import {
  BRAND_MARK_HORIZON,
  BRAND_MARK_INITIALS,
  BRAND_MARK_RING,
  BRAND_MARK_SUN,
  BRAND_MARK_WAVES,
} from '@/lib/brand-mark';

/** The site's mark (lib/brand-mark.ts) for the admin's brand: its colours are `.a-brand-mark`'s (styles/admin.css). Decorative: the link around it carries the name. */
export function BrandMark({ className, initials = true }: { className?: string; initials?: boolean }) {
  return (
    <svg className={className ? `brand-mark ${className}` : 'brand-mark'} viewBox="0 0 64 64" aria-hidden="true">
      <path d={BRAND_MARK_WAVES} fill="none" stroke="currentColor" strokeWidth="2" />
      <g className="brand-mark-gold">
        <circle {...BRAND_MARK_RING} fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d={BRAND_MARK_HORIZON} fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle {...BRAND_MARK_SUN} fill="currentColor" />
        {initials && <path d={BRAND_MARK_INITIALS} fill="currentColor" />}
      </g>
    </svg>
  );
}
