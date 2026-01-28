import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppMode = 'planning' | 'expenses';

interface AppModeState {
    appMode: AppMode;
    setAppMode: (mode: AppMode) => void;
}

export const useAppModeStore = create<AppModeState>()(
    persist(
        (set) => ({
            appMode: 'planning',
            setAppMode: (mode) => set({ appMode: mode }),
        }),
        {
            name: 'budgy-app-mode',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
