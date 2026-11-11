
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing customer session
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/v1/auth/customer/me",
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setUser(null);
        return null;
      }

      setUser(data.user || null);

      return data.user || null;
    } catch (error) {
      console.error("Auth session error:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout customer using existing global API
  const logout = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/v1/auth/logout",
        {
          method: "POST",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Logout failed."
        );
      }

      setUser(null);

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }, []);

  // Check session when application loads
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom authentication hook
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );
  }

  return context;
}
