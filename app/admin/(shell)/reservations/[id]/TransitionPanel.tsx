'use client';

import { useAdminAction } from '@/lib/admin/use-admin-action';
import { useId, useState, type FormEvent } from 'react';
import { submitKeepingValues } from '@/lib/admin/form';
import type { ReservationStatus } from '@/lib/booking/rules';
import { STATUS_LABELS } from '@/lib/reservations/lifecycle';
import type { ActionResult } from '@/lib/server/action-result';
import { FieldError, FormMessage, invalidField } from '../../_ui/FormMessage';
import { changeStatus, type StatusChange } from '../actions';

export type TransitionOption = { to: ReservationStatus; label: string; reasonRequired: boolean; enabled: boolean; hint: string | null };

/*
 * One form, one button per transition the status allows; submitKeepingValues
 * builds the FormData with the clicked button, so its name/value reaches the
 * action. The version is the one this page was drawn with: a stale one comes
 * back as "Vừa được … thay đổi". The server checks the windows and reasons again.
 *
 * Guest email (spec §10.3, R8): confirming and declining always email a guest
 * who gave an address; a cancel does when "Báo khách qua email khi hủy" stays
 * ticked (on by default). Only the decline and cancel emails quote the reason,
 * so the hint under the one reason field names them, and only when the guest
 * gave an address: staff often type it in Vietnamese for an English email.
 * A guest without an address gets no box at all, but a line saying to phone:
 * a ticked box there would promise an email nobody sends.
 *
 * The notice after a change names the new status and whether an email is on
 * its way, so a change staff did not mean to make cannot pass as "updated".
 *
 * Once the sitting has started no booking email goes out (phase-5 F5: the
 * sender skips it), so the panel offers no "Báo khách" box and no "sent to
 * the guest" hint then, says so instead, and the notice of a change says why
 * no email went (phase-5 ledger, the past-sitting residual).
 *
 * Ids come from useId: Next keeps an earlier booking's page mounted (hidden,
 * in <Activity>) after a move to another, and fixed ids would then point
 * `htmlFor` and `aria-describedby` at the hidden copy (phase-5 ledger).
 */
const LANGUAGE_NAMES: Record<string, string> = { en: 'tiếng Anh', ko: 'tiếng Hàn', zh: 'tiếng Trung', ja: 'tiếng Nhật', fr: 'tiếng Pháp', ru: 'tiếng Nga' };

export function TransitionPanel({
  id,
  version,
  options,
  hasEmail,
  guestLocale = 'vi',
  sittingPassed = false,
}: {
  id: string;
  version: number;
  options: TransitionOption[];
  hasEmail: boolean;
  /** The language the guest booked in: the emails are in it, the reason staff type goes in as written. */
  guestLocale?: string;
  /** The sitting has started: no booking email goes out any more (F5). */
  sittingPassed?: boolean;
}) {
  const uid = useId();
  const [state, action, pending] = useAdminAction<ActionResult<StatusChange> | null, FormData>(changeStatus, null);
  // The reason and "Báo khách" keep what staff typed and chose through every refusal (no reason; a conflict,
  // then "Tải lại"), so an unticked box never comes back ticked behind their back. Only a change made here
  // starts them over: taken during render when its result arrives, not in an effect, and not with a key,
  // which would remount the hook's state above with them.
  const [draft, setDraft] = useState({ state, reason: '', notify: true });
  if (draft.state !== state) setDraft(state?.ok ? { state, reason: '', notify: true } : { ...draft, state });
  const done = state?.ok ? state.data : null;
  // The past-sitting reason only after a change that would have emailed the guest (the server says which).
  const emailNote = done?.emailed ? ' Email báo khách đang được gửi.' : hasEmail && done?.pastSitting ? ' Không gửi email cho khách: đã qua giờ hẹn.' : '';
  const success = done ? `Đã chuyển sang “${STATUS_LABELS[done.status]}”.${emailNote}` : undefined;
  if (options.length === 0) {
    // A change that ended the booking (a cancel) still says what it did, and whether the guest is being emailed.
    return (
      <>
        <FormMessage state={done ? state : null} success={success} />
        <p className="a-muted">Đặt bàn đã kết thúc; không còn thao tác nào.</p>
      </>
    );
  }
  const needsReason = options.some((o) => o.reasonRequired);
  const canCancel = options.some((o) => o.to === 'cancelled');
  const canDecline = options.some((o) => o.to === 'declined');
  // The buttons whose email quotes the reason: a decline's always, a cancel's while "Báo khách" is ticked.
  const emails = hasEmail && !sittingPassed;
  const quotedBy = emails ? [canDecline ? 'từ chối' : null, canCancel && draft.notify ? 'hủy' : null].filter((b) => b !== null) : [];
  // A guest who booked in another language gets the reason as typed, inside an email in their language: a
  // Vietnamese reason reached English-speaking guests (UX/UI audit 2026-11-25, EM-01).
  const foreign = guestLocale !== 'vi' ? (LANGUAGE_NAMES[guestLocale] ?? guestLocale) : null;
  const reasonHint = quotedBy.length
    ? `Khi ${quotedBy.join(' hoặc ')}, lý do này sẽ được gửi nguyên văn cho khách.${foreign ? ` Khách đặt bằng ${foreign}: hãy viết lý do bằng ${foreign}.` : ''}`
    : null;
  // The changes that cannot be taken back ask first, and say whether the guest is emailed (UX/UI audit
  // 2026-11-25, AB-05: one tap cancelled or declined a booking and emailed its guest). Like "Xóa ngày đóng cửa".
  const submit = submitKeepingValues(action);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const to = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;
    const option = options.find((o) => o.to === to);
    const ask =
      to === 'cancelled'
        ? `Hủy đặt bàn này?${emails && draft.notify ? ' Khách sẽ nhận email báo hủy.' : ''} Không hoàn tác được.`
        : to === 'declined'
          ? `Từ chối yêu cầu này?${emails ? ' Khách sẽ nhận email báo từ chối.' : ''} Không hoàn tác được.`
          : to === 'no_show'
            ? 'Đánh dấu khách không đến?'
            : null;
    // A missing reason is refused first, without a question.
    if (ask && option?.enabled && !(option.reasonRequired && !draft.reason.trim()) && !window.confirm(ask)) {
      event.preventDefault();
      return;
    }
    submit(event);
  };
  return (
    // Not action={action}: React resets a form once its action settles, whatever it returned, and that reset
    // ticked "Báo khách" again after a refused cancel, so the next cancel emailed a guest staff chose not to.
    // method="post": a submit before hydration must not GET the reason into the URL.
    <form className="a-transitions" method="post" onSubmit={onSubmit}>
      {/* Enter in "Lý do" (implicit submission) clicks the form's first submit button: "Xác nhận" on a request,
          "Hủy" with "Báo khách" ticked on a confirmed booking, which then emails the guest a note meant for
          staff. A disabled first submit button makes Enter submit nothing (HTML: implicit submission does
          nothing when the default button is disabled). Not an onKeyDown handler: a Vietnamese Telex IME
          composes with Enter. lib/admin/admin-pages.guard.test.ts keeps this button first and disabled. */}
      <button type="submit" disabled hidden aria-hidden="true" tabIndex={-1} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <FormMessage state={state} success={success} />
      <div className="a-field">
        <label htmlFor={`${uid}-reason`}>{needsReason ? 'Lý do (bắt buộc khi hủy hoặc từ chối)' : 'Lý do (không bắt buộc)'}</label>
        <input
          id={`${uid}-reason`}
          name="reason"
          maxLength={500}
          value={draft.reason}
          onChange={(e) => {
            const reason = e.target.value;
            setDraft((d) => ({ ...d, reason }));
          }}
          aria-describedby={reasonHint ? `${uid}-reason-hint ${uid}-reason-error` : `${uid}-reason-error`}
          aria-invalid={invalidField(state, 'reason')}
        />
        {reasonHint ? (
          <small className="a-sub" id={`${uid}-reason-hint`}>
            {reasonHint}
          </small>
        ) : null}
        <FieldError state={state} name="reason" id={`${uid}-reason-error`} />
      </div>
      {canCancel && emails ? (
        <label className="a-check">
          <input
            type="checkbox"
            name="notifyGuest"
            checked={draft.notify}
            onChange={(e) => {
              const notify = e.target.checked;
              setDraft((d) => ({ ...d, notify }));
            }}
          />
          Báo khách qua email khi hủy
        </label>
      ) : null}
      {canCancel && !hasEmail ? <p className="a-muted">Khách không để lại email: thay đổi ở đây không gửi email nào, hãy gọi điện báo khách.</p> : null}
      {hasEmail && sittingPassed ? <p className="a-muted">Đã qua giờ hẹn: thay đổi ở đây không gửi email cho khách, hãy gọi điện nếu cần báo.</p> : null}
      {emails && options.some((o) => o.to === 'confirmed' && o.enabled) ? <p className="a-muted">Bấm “Xác nhận” sẽ gửi email xác nhận cho khách.</p> : null}
      <div className="a-actions">
        {options.map((o) => (
          <span className="a-action" key={o.to}>
            <button
              className={`a-btn${o.to === 'cancelled' || o.to === 'declined' || o.to === 'no_show' ? ' a-btn--danger' : ''}`}
              type="submit"
              name="to"
              value={o.to}
              disabled={pending || !o.enabled}
            >
              {o.label}
            </button>
            {o.hint ? <small className="a-sub">{o.hint}</small> : null}
          </span>
        ))}
      </div>
    </form>
  );
}
