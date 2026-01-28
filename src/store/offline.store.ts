import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CreatePersonalExpensePayload } from '../types/expenses.type';

interface OfflineExpense extends CreatePersonalExpensePayload {
    tempId: string; // To identify and remove from queue
    timestamp: number;
}

interface OfflineState {
    queue: OfflineExpense[];
    addToQueue: (expense: CreatePersonalExpensePayload) => void;
    removeFromQueue: (tempId: string) => void;
    clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
    persist(
        (set) => ({
            queue: [],
            addToQueue: (expense) =>
                set((state) => ({
                    queue: [
                        ...state.queue,
                        {
                            ...expense,
                            tempId: Math.random().toString(36).substring(7),
                            timestamp: Date.now(),
                        },
                    ],
                })),
            removeFromQueue: (tempId) =>
                set((state) => ({
                    queue: state.queue.filter((item) => item.tempId !== tempId),
                })),
            clearQueue: () => set({ queue: [] }),
        }),
        {
            name: 'budgy-offline-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
