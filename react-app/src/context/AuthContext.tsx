import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserSession } from '../types/page';
import {
  subscribeAuth,
  loginWithCredentials,
  logoutUser,
  getCurrentSession,
} from '../firebase/auth';

interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(getCurrentSession());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserSession> => {
    setLoading(true);
    try {
      const loggedUser = await loginWithCredentials(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
