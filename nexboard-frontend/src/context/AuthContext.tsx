import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  auth: AuthUser | null;
  employeeId: number | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  setEmployeeId: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  });

  const [employeeId, setEmployeeIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem('employeeId');
    return raw ? Number(raw) : null;
  });

  const login = (user: AuthUser) => {
    setAuth(user);
    localStorage.setItem('auth', JSON.stringify(user));
  };

  const logout = () => {
    setAuth(null);
    setEmployeeIdState(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('employeeId');
  };

  const setEmployeeId = (id: number) => {
    setEmployeeIdState(id);
    localStorage.setItem('employeeId', String(id));
  };

  return (
    <AuthContext.Provider value={{ auth, employeeId, login, logout, setEmployeeId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
