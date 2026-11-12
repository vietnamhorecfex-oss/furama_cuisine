'use client';

import { useActionState } from 'react';
import type { ActionResult } from '@/lib/server/action-result';
import { FormMessage } from '../_ui/FormMessage';
import { applyShippedTranslationPack, type PackRun } from './actions';

/*
 * "Áp gói bản dịch" (owner, 2026-11-12): one form per pack shipped with the
 * code. "Xem trước" says what applying would do and changes nothing; "Áp
 * dụng" writes it. A translation staff already wrote, or whose English
 * changed since, is skipped and listed with the reason.
 */
export function ApplyPack({ id, label, canApply }: { id: string; label: string; canApply: boolean }) {
  const [state, dispatch, pending] = useActionState<ActionResult<PackRun> | null, FormData>(applyShippedTranslationPack, null);
  const run = state?.ok ? state.data : null;
  return (
    <form action={dispatch} aria-label={`Gói bản dịch: ${label}`} className="a-section-card">
      <input type="hidden" name="pack" value={id} />
      <p>{label}</p>
      <div className="a-actions">
        <button type="submit" name="mode" value="preview" className="a-btn a-btn--ghost" disabled={pending || !canApply}>
          Xem trước
        </button>
        <button type="submit" name="mode" value="apply" className="a-btn" disabled={pending || !canApply}>
          Áp dụng
        </button>
      </div>
      <FormMessage state={state && !state.ok ? state : null} />
      {run ? (
        <div role="status" className="a-notice">
          <p>
            {run.dryRun
              ? `Xem trước: sẽ áp ${run.applied.length} mục, bỏ qua ${run.skipped.length} mục. Chưa có gì thay đổi.`
              : `Đã áp ${run.applied.length} mục, bỏ qua ${run.skipped.length} mục. Trang khách cập nhật ngay.`}
          </p>
          {run.skipped.length > 0 ? (
            <details>
              <summary>Các mục bỏ qua</summary>
              <ul className="a-list">
                {run.skipped.map((s) => (
                  <li key={s.item}>
                    {s.item}: <span className="a-muted">{s.reason}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
