import { create } from 'zustand';
import type { User } from '@/type';
import { account, getCurrentUser } from '@/lib/appwrite';

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      // Decide auth by session presence
      const me = await account.get().catch(() => null);
      if (!me) {
        set({ isAuthenticated: false, user: null });
      } else {
        // Profile doc can be null; still authenticated if session exists
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
