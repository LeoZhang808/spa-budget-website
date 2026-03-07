import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as authApi from '../api/authClient';
import type { User } from '../api/authClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    email?: string;
    display_name?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authApi.login(email, password);
    setUser(user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const user = await authApi.register(email, password, displayName);
      setUser(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: { email?: string; display_name?: string }) => {
      const updated = await authApi.updateProfile(data);
      setUser(updated);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
