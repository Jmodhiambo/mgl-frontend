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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
        console.log('🔄 Attempting to restore session...');
        console.log('🍪 Cookies:', document.cookie);  // See all cookies
        
        // Attempt to refresh token
        const response = await api.post("/auth/refresh");
        console.log('✅ Refresh successful:', response.data);


        const accessToken = response.data.access_token;

        setAccessToken(accessToken);

        // Fetch current user
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to restore session:", error);
        console.log('🍪 Cookies after failure:', document.cookie);

        // Proper axios error handling
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;
          const detail = error.response?.data?.detail || error.response?.data?.message;
  
          if (statusCode === 401) {
            // Unauthorized error
            console.log('🚫 Exact unauthorized error from backend:', detail);
            // Log out user and clear session
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        isRestoringSession.current = false;
      }
    };

    restoreSession();
  }, []);

  const login = async (accessToken: string) => {
    setAccessToken(accessToken);

    try {
      // Fetch user data after login
      const fetchUser = await getCurrentUser();
      setUser(fetchUser);      
      setIsAuthenticated(true);
      } catch (error) {
      console.error("Failed to fetch user after login:", error);
      // Even if user fetch fails, we're authenticated
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      hasAttemptedRestore.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
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