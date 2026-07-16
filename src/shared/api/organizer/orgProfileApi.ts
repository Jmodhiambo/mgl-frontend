// src/shared/api/organizer/orgProfileApi.ts

import api from '@shared/api/axiosConfig';
import type { RefreshSession } from '@shared/types/Auth';

// ─── Organizer app session calls ──────────────────────────────────────────────
// Backend: GET/DELETE /organizer/sessions  (organizer_sessions_router.py)

export const getOrganizerSessions = async (): Promise<RefreshSession[]> => {
  return (await api.get('/organizer/sessions')).data;
};

export const revokeOrganizerSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/organizer/sessions/${sessionId}`);
};

export const revokeAllOtherOrganizerSessions = async (
  currentSessionId: string
): Promise<{ revoked_count: number; message: string }> => {
  return (await api.delete('/organizer/sessions', {
    data: { current_session_id: currentSessionId },
  })).data;
};

export const changeOrganizerPassword = async (
  old_password: string,
  new_password: string
): Promise<void> => {
  await api.patch('/users/me/change-password', { old_password, new_password });
};