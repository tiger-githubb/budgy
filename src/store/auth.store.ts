import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isInitialized: boolean;

    initialize: () => Promise<void>;
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({
                session,
                user: session?.user ?? null,
                isLoading: false,
                isInitialized: true,
            });

            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                });
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    setSession: (session) => {
        set({
            session,
            user: session?.user ?? null,
        });
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
            set({ user: null, session: null });
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
