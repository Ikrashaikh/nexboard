import { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth')); } catch { return null; }
  });

  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState(() => {
    const v = localStorage.getItem('selectedEmployeeId');
    return v ? Number(v) : null;
  });

  const login = useCallback((authData) => {
    // Strip ROLE_ prefix if backend ever returns it
    const cleaned = { ...authData, role: authData.role.replace('ROLE_', '') };
    setAuth(cleaned);
    localStorage.setItem('auth', JSON.stringify(cleaned));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    setSelectedEmployeeIdState(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('selectedEmployeeId');
  }, []);

  const setSelectedEmployeeId = useCallback((id) => {
    setSelectedEmployeeIdState(id);
    localStorage.setItem('selectedEmployeeId', String(id));
  }, []);

  const clearSelectedEmployee = useCallback(() => {
    setSelectedEmployeeIdState(null);
    localStorage.removeItem('selectedEmployeeId');
  }, []);

  return (
    <AuthContext.Provider value={{
      auth,
      selectedEmployeeId,
      login,
      logout,
      setSelectedEmployeeId,
      clearSelectedEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
