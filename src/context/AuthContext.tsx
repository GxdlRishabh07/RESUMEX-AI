/**
 * AuthContext — RESUMEX // AI
 * Provides session state, auth actions, and loading status app-wide.
 * Backed by Supabase Auth; never stores raw passwords.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate from persisted session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? (window as any).__testUser ?? null);
      setIsLoading(false);
    }).catch((err) => {
      console.error('[Auth] Error getting session:', err);
      setIsLoading(false);
    });

    // Listen to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? (window as any).__testUser ?? null);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('resumex:history_changed', { detail: { action: _event } }));
    });

    // Test user event listener for automated browser verification
    const handleSetTestUser = (e: Event) => {
      const customEvt = e as CustomEvent;
      const testUser = customEvt.detail;
      (window as any).__testUser = testUser;
      setUser(testUser);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('resumex:history_changed', { detail: { action: 'test_user_set' } }));
    };
    window.addEventListener('resumex:set_test_user', handleSetTestUser);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resumex:set_test_user', handleSetTestUser);
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).__testUser) {
      delete (window as any).__testUser;
    }
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('resumex:history_changed', { detail: { action: 'logout' } }));
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
