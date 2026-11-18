import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const STORAGE_KEY = 'auth';
const AuthContext = createContext(null);

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStored);

  const persist = useCallback((next) => {
    setSession(next);
    try {
      if (next.token) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable - keep the session in memory only */
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { token, user } = await authApi.login(credentials);
      persist({ token, user });
      return user;
    },
    [persist]
  );

  const logout = useCallback(() => persist({ token: null, user: null }), [persist]);
  const updateUser = useCallback((user) => persist({ token: session.token, user }), [persist, session.token]);

  const value = useMemo(
    () => ({ ...session, isAuthenticated: Boolean(session.token), login, logout, updateUser }),
    [session, login, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
