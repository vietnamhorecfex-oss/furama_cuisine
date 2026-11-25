'use client';

import { useAdminAction } from '@/lib/admin/use-admin-action';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { submitKeepingValues } from '@/lib/admin/form';
import type { ActionResult } from '@/lib/server/action-result';
import { FormMessage } from '../_ui/FormMessage';
import { changeStatus, type StatusChange } from './actions';

/*
 * "Xác nhận" straight from the inbox; the version turns a stale row into a
 * conflict, never a silent overwrite. A conflict offers "Tải lại" like every
 * other form (FormMessage), and a refusal shows only while the row still has
 * the version it came back for: once a refresh brings the row as it is now
 * (still requested, a newer version), "Vừa được … thay đổi" would be stale
 * (phase-4 ledger T9).
 *
 * A confirmed row leaves the list and the next one slides up under the
 * finger: a second tap confirmed that booking too, and emailed its guest,
 * with nothing on screen (UX/UI audit 2026-11-25, AB-01). So every "Xác
 * nhận" on the page waits a moment after one is pressed, and the page says
 * whom it confirmed (QuickConfirmNotice).
 */
const PAUSE_MS = 1500;
let pausedUntil = 0;
let pausedBy = '';
let notice = '';
const listeners = new Set<() => void>();
const setNotice = (text: string) => {
  notice = text;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Says, once per confirmation, whom "Xác nhận" just confirmed. Render it above the list. */
export function QuickConfirmNotice() {
  const text = useSyncExternalStore(subscribe, () => notice, () => '');
  // A live region always there, so a screen reader hears each new sentence; it draws only with one. Not role=status:
  // the page's own status line (the inbox's search) stays the one status region of the list.
  return <div aria-live="polite">{text ? <p className="a-notice">{text}</p> : null}</div>;
}

export function QuickConfirm({ id, version, reference, who }: { id: string; version: number; reference: string; who?: string }) {
  const [state, action, pending] = useAdminAction<ActionResult<StatusChange> | null, FormData>(async (prev, formData) => {
    const result = await changeStatus(prev, formData);
    if (result.ok) setNotice(`Đã xác nhận ${who ?? reference} (${reference}). Khách sẽ nhận email xác nhận nếu có để email.`);
    return result;
  }, null);
  const [seen, setSeen] = useState({ state, version });
  if (seen.state !== state) setSeen({ state, version });
  const refusal = state && !state.ok && seen.version === version ? state : null;
  const submit = submitKeepingValues(action);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Another row's "Xác nhận" only: this row pressed again (after a conflict and "Tải lại") goes through.
    if (Date.now() < pausedUntil && pausedBy !== id) {
      e.preventDefault();
      return;
    }
    pausedUntil = Date.now() + PAUSE_MS;
    pausedBy = id;
    submit(e);
  };
  return (
    <form method="post" onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <button className="a-btn a-btn--small" type="submit" name="to" value="confirmed" disabled={pending} aria-label={`Xác nhận ${reference}`}>
        Xác nhận
      </button>
      <FormMessage state={refusal} />
    </form>
  );
}
