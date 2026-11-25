'use client';

import { unstable_rethrow } from 'next/navigation';
import { useActionState, useCallback, useRef } from 'react';
import type { ActionFailure } from '@/lib/server/action-result';

/*
 * useActionState for an admin Server Action that never throws (lib/server/action-result.ts), so a throw
 * here is the trip itself: the network dropped, or the server answered with an error page. Plain
 * useActionState sent that to the page's error boundary, which replaced the whole editor with "Không tải
 * được trang" and lost what staff had typed (UX/UI audit 2026-11-25, AN-02 / AH-02 / AB-02). Here it
 * becomes a `network` failure the form shows beside its fields, which keep their values. Next's own
 * control flow (a redirect) still passes through.
 */
export function useAdminAction<S, P>(action: (state: Awaited<S>, payload: P) => S | Promise<S>, initialState: Awaited<S>) {
  const latest = useRef(action);
  latest.current = action;
  const guarded = useCallback(async (state: Awaited<S>, payload: P): Promise<S> => {
    try {
      return await latest.current(state, payload);
    } catch (error) {
      unstable_rethrow(error);
      console.error('admin_action_failed', error instanceof Error ? error.message : error);
      const failure: ActionFailure = { ok: false, code: 'network' };
      return failure as S;
    }
  }, []);
  return useActionState<S, P>(guarded, initialState);
}
