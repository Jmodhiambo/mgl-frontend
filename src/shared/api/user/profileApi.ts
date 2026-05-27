// src/shared/api/user/profileApi.ts

import api from '@shared/api/axiosConfig';
import type { RefreshSession } from '@shared/types/Auth';

// ─── User app session calls ───────────────────────────────────────────────────
// Backend: GET/DELETE /user/sessions  (user_sessions_router.py)

export const getUserSessions = async (): Promise<RefreshSession[]> => {
  return (await api.get('/user/sessions')).data;
};

export const revokeUserSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/user/sessions/${sessionId}`);
};

export const revokeAllOtherUserSessions = async (
  currentSessionId: string
): Promise<{ revoked_count: number; message: string }> => {
  return (await api.delete('/user/sessions', {
    data: { current_session_id: currentSessionId },
  })).data;
};