// store/auth.store.ts
import { create } from 'zustand';
import type { User } from '@/type';
import { account, getCurrentUser } from '@/lib/appwrite';

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  // Derived role helpers
  isAdmin: () => boolean;
  isHost: () => boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  // role helpers based on the loaded user document
  isAdmin: () => get().user?.role === 'admin',
  isHost: () => {
    const role = get().user?.role ?? 'guest';
    return role === 'host' || role === 'admin';
  },

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  // Decide auth by Appwrite session existence; then load profile document
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const me = await account.get().catch(() => null);
      if (!me) {
        set({ isAuthenticated: false, user: null });
      } else {
        const profile = await getCurrentUser().catch(() => null);
        set({ isAuthenticated: true, user: (profile as User) ?? null });
      }
    } catch (e) {
      console.log('fetchAuthenticatedUser error', e);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
