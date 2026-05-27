// src/shared/hooks/useOrganizerProfile.ts
// Hook for fetching and caching the organizer profile status

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import api from '@shared/api/axiosConfig';

export interface OrganizerProfileStatus {
  profile_completed: boolean;
  missing_fields: string[];
}

// Human-readable labels for each missing field key
export const FIELD_LABELS: Record<string, string> = {
  organization_name:   'Add your organization name',
  bio:                 'Write a short bio',
  profile_picture_url: 'Upload a profile picture',
  area_of_expertise:   'Add your area of expertise',
  website_url:         'Add your website (optional)',
};

interface UseOrganizerProfileReturn {
  status: OrganizerProfileStatus | null;
  loading: boolean;
  /** Call this after the organizer completes setup to bust the cache */
  refetch: () => Promise<void>;
}

// Module-level cache — survives re-renders, cleared on logout via refetch()
let cachedStatus: OrganizerProfileStatus | null = null;

export function useOrganizerProfile(): UseOrganizerProfileReturn {
  const { user, isAuthenticated } = useAuth();
  const isOrganizer = isAuthenticated && user?.role === 'organizer';

  const [status, setStatus] = useState<OrganizerProfileStatus | null>(cachedStatus);
  const [loading, setLoading] = useState<boolean>(isOrganizer && cachedStatus === null);
  const hasFetched = useRef<boolean>(cachedStatus !== null);

  const fetchStatus = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<OrganizerProfileStatus>('/users/me/organizer');
      cachedStatus = response.data;
      setStatus(response.data);
    } catch (error) {
      console.error('[useOrganizerProfile] Failed to fetch organizer profile status:', error);
      // On error, treat as incomplete so the UI nudges rather than silently unlocking
      const fallback: OrganizerProfileStatus = { profile_completed: false, missing_fields: [] };
      cachedStatus = fallback;
      setStatus(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch for organizers, and only once per session (cache hit skips fetch)
    if (!isOrganizer) return;
    if (hasFetched.current) return;

    hasFetched.current = true;
    fetchStatus();
  }, [isOrganizer]);

  // Reset cache when user logs out (role becomes null)
  useEffect(() => {
    if (!isOrganizer) {
      cachedStatus = null;
      hasFetched.current = false;
      setStatus(null);
    }
  }, [isOrganizer]);

  const refetch = async (): Promise<void> => {
    cachedStatus = null;
    hasFetched.current = false;
    await fetchStatus();
  };

  return { status, loading, refetch };
}