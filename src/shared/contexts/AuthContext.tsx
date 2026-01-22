/**
 * Authentication Context Module
 */

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import api, { setAccessToken } from "@shared/api/axiosConfig";
import type { AuthContextType } from "@shared/types/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const isRestoringSession = useRef(false);
  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    if (hasAttemptedRestore.current || isRestoringSession.current) {
      return;
    }

    isRestoringSession.current = true;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        const accessToken = response.data.access_token;

        setAccessToken(accessToken);
        setIsAuthenticated(true);
      } catch (error) {
        setAccessToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        isRestoringSession.current = false;
      }
    };

    restoreSession();
  }, []);

  const login = (accessToken: string) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      hasAttemptedRestore.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};