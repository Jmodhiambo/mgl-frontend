/**
 * Authentication Context Module
 * Creates a global authentication state for a React application using Context
 * It lets any component know whether a user is logged in, what the current token is, 
 * and provides functions to log in or log out
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api, { setAccessToken } from "@shared/auth/axiosConfig";
import type { AuthContextType } from "@shared/types/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Attempt session restore on app load.
   * Browser sends refresh token cookie automatically.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        const accessToken = response.data.access_token;

        setAccessToken(accessToken);
        setIsAuthenticated(true);
      } catch {
        setAccessToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Called after successful login
   */
  const login = (accessToken: string) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };

  /**
   * Logout clears server session and in memory token
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
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

/**
 * Safe hook for consuming auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};