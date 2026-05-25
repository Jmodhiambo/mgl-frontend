/**
 * Authentication Context Module
 */

import axios from "axios";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import api, { setAccessToken } from "@shared/api/axiosConfig";
import type { AuthContextType } from "@shared/types/Auth";
import { logoutUser } from "@shared/api/auth/authApi";
import { getCurrentUser } from "@shared/api/user/usersApi";
import type { User } from "@shared/types/User";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]                       = useState<User | null>(null);
  const [sessionId, setSessionId]             = useState<string | null>(null);
  const [loading, setLoading]                 = useState(true);

  const isRestoringSession  = useRef(false);
  const hasAttemptedRestore = useRef(false);

  // ── Session restore on mount ────────────────────────────────────────────────
  // Calls /auth/refresh using the HttpOnly refresh-token cookie.
  // If successful, the response body contains both access_token and session_id.

  useEffect(() => {
    if (hasAttemptedRestore.current || isRestoringSession.current) return;

    isRestoringSession.current  = true;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        console.log("Attempting to restore session...");

        const response = await api.post("/auth/refresh");

        // Both access_token and session_id come back in the response body.
        // session_id rotates on every refresh, so we always update it here.
        const { access_token, session_id } = response.data;

        setAccessToken(access_token);
        setSessionId(session_id ?? null);

        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to restore session:", error);

        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;
          const detail     = error.response?.data?.detail || error.response?.data?.message;

          if (statusCode === 401) {
            console.log("Unauthorized — clearing session:", detail);
          }
        }

        setAccessToken(null);
        setSessionId(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        isRestoringSession.current = false;
      }
    };

    restoreSession();
  }, []);

  // ── login ───────────────────────────────────────────────────────────────────
  // Called after a successful POST /auth/login.

  const login = async (loginResponse: { access_token: string; session_id?: string }) => {
    const { access_token, session_id } = loginResponse;

    setAccessToken(access_token);
    setSessionId(session_id ?? null);

    try {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
      // Token is valid even if the user fetch fails — still mark authenticated.
      setIsAuthenticated(true);
    }
  };

  // ── logout ──────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setSessionId(null);
      setUser(null);
      setIsAuthenticated(false);
      hasAttemptedRestore.current = false;
    }
  };

  // ── Context value ───────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        sessionId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};