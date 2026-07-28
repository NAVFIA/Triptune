import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserResponse, AuthResponse } from '../types/auth';
import { getToken, setToken as saveToken, removeToken, getStoredUser, setStoredUser } from '../utils/token';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUserState] = useState<UserResponse | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const existingToken = getToken();
    const existingUser = getStoredUser();
    if (existingToken && existingUser) {
      setTokenState(existingToken);
      setUserState(existingUser);
    } else if (!existingToken) {
      removeToken();
      setTokenState(null);
      setUserState(null);
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    saveToken(authData.token);
    setStoredUser(authData.user);
    setTokenState(authData.token);
    setUserState(authData.user);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
