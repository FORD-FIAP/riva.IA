import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/vehicle';

interface User {
  fullName: string;
  nickname: string;
  email: string;
  preferences: string;
  /** Compat: alguns componentes (Header, Sidebar) leem user.name como apelido curto. */
  name: string;
}

export type AuthPromptContext =
  | { type: 'vehicle'; vehicle: Vehicle }
  | { type: 'comparison'; vehicleA: Vehicle; vehicleB: Vehicle }
  | { type: 'chat' }
  | { type: 'login' };

interface RegisterPayload {
  fullName: string;
  email: string;
}

interface ProfileUpdates {
  nickname?: string;
  email?: string;
  preferences?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: RegisterPayload) => void;
  /** Cria a conta (registra o e-mail) e já loga com ela. */
  register: (payload: RegisterPayload) => void;
  /** Nome cadastrado pra esse e-mail, ou null se nenhuma conta existe com ele. */
  findAccount: (email: string) => string | null;
  updateProfile: (updates: ProfileUpdates) => void;
  logout: () => void;
  authPrompt: AuthPromptContext | null;
  requestLogin: (ctx: AuthPromptContext, onSuccess?: () => void) => void;
  closeLogin: () => void;
  runPendingAction: () => void;
}

const STORAGE_KEY = '@riva/user';
const ACCOUNTS_STORAGE_KEY = '@riva/accounts';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  findAccount: () => null,
  updateProfile: () => {},
  logout: () => {},
  authPrompt: null,
  requestLogin: () => {},
  closeLogin: () => {},
  runPendingAction: () => {},
});

function firstNameOf(full: string): string {
  return full.trim().split(/\s+/)[0] ?? '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [authPrompt, setAuthPrompt] = useState<AuthPromptContext | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          if (parsed && parsed.fullName) setUser(parsed);
        }
        const rawAccounts = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (rawAccounts) {
          const parsedAccounts = JSON.parse(rawAccounts);
          if (parsedAccounts && typeof parsedAccounts === 'object') setAccounts(parsedAccounts);
        }
      } catch {
        /* noop */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts)).catch(() => {});
  }, [accounts, hydrated]);

  function login({ fullName, email }: RegisterPayload) {
    const nickname = firstNameOf(fullName);
    setUser({
      fullName: fullName.trim(),
      nickname,
      email: email.trim(),
      preferences: '',
      name: nickname,
    });
  }

  function register({ fullName, email }: RegisterPayload) {
    const key = email.trim().toLowerCase();
    setAccounts((prev) => ({ ...prev, [key]: fullName.trim() }));
    login({ fullName, email });
  }

  function findAccount(email: string): string | null {
    return accounts[email.trim().toLowerCase()] ?? null;
  }

  function updateProfile(updates: ProfileUpdates) {
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        ...updates,
        nickname: updates.nickname ?? prev.nickname,
        name: updates.nickname ?? prev.nickname,
      };
      return next;
    });
  }

  function requestLogin(ctx: AuthPromptContext, onSuccess?: () => void) {
    setAuthPrompt(ctx);
    setPendingAction(() => onSuccess ?? null);
  }

  function closeLogin() {
    setAuthPrompt(null);
    setPendingAction(null);
  }

  function runPendingAction() {
    if (pendingAction) pendingAction();
    setPendingAction(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        register,
        findAccount,
        updateProfile,
        logout: () => setUser(null),
        authPrompt,
        requestLogin,
        closeLogin,
        runPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}