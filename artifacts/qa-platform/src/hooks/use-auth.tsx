import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetMe, type User } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('qa_token'));
  
  // Set default header for future requests globally if possible, 
  // but we rely on customFetch intercepting this token.
  // In a real app, customFetch in @workspace/api-client-react should read 'qa_token' from localStorage.

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const login = (newToken: string) => {
    localStorage.setItem('qa_token', newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('qa_token');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading: isUserLoading && !!token,
      login,
      logout,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
